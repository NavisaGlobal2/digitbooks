
/**
 * Direct Excel parser for Edge Function that preserves original data format
 * This parses Excel files directly without using AI processing
 */

// Check if a file is an Excel file based on extension
export const isExcelFile = (file: File): boolean => {
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  
  // Check mime type
  if (excelMimeTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return excelExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Parse Excel file directly to extract data in its original format
 * @param file Excel file to parse 
 * @returns Array of transaction objects with original data preserved
 */
export async function parseExcelDirectly(file: File): Promise<any[]> {
  // Since we can't use SheetJS in the Edge Function environment,
  // we'll use binary data extraction combined with pattern recognition
  
  try {
    // Extract binary data from the file
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Find potential table data in the Excel binary
    const tableData = extractTabularDataFromBinary(bytes);
    
    if (!tableData || tableData.length === 0) {
      console.log("No table data found in Excel binary");
      return [];
    }
    
    console.log(`Found ${tableData.length} potential rows of data`);
    
    // Find potential headers in the first few rows
    const headerRowIndex = findHeaderRowIndex(tableData);
    if (headerRowIndex === -1) {
      console.log("Could not find header row in Excel data");
      return [];
    }
    
    // Get headers
    const headers = tableData[headerRowIndex];
    
    // Process rows after the header
    const transactions = [];
    
    for (let i = headerRowIndex + 1; i < tableData.length; i++) {
      const row = tableData[i];
      
      // Skip empty rows
      if (row.filter(Boolean).length === 0) continue;
      
      // Create transaction object by mapping row to headers
      const transaction: Record<string, any> = {};
      
      for (let j = 0; j < headers.length; j++) {
        if (j < row.length) {
          const headerName = headers[j]?.toString().toLowerCase().trim() || `column${j}`;
          const cellValue = row[j];
          
          // Map to standard field names when possible
          if (headerName.includes('date') || headerName.includes('time')) {
            transaction.date = cellValue; // Keep original date format
            transaction.originalDate = cellValue; // Store original date separately
          } else if (headerName.includes('desc') || 
                    headerName.includes('narr') || 
                    headerName.includes('part') || 
                    headerName.includes('det')) {
            transaction.description = cellValue;
          } else if (headerName.includes('amount') || 
                    headerName.includes('value') || 
                    headerName.includes('sum') || 
                    headerName.includes('debit') || 
                    headerName.includes('credit')) {
            // Try to determine if it's a number and the sign
            const numValue = parseFloat(cellValue?.toString().replace(/[^\d.-]/g, '') || '0');
            if (!isNaN(numValue)) {
              transaction.amount = numValue;
              transaction.type = numValue < 0 ? 'debit' : 'credit';
            }
          }
          
          // Also store the original field with its original name and value
          transaction[`original_${headerName}`] = cellValue;
        }
      }
      
      // Only add if we have at least a description or amount
      if (transaction.description || transaction.amount !== undefined) {
        // Generate a unique ID
        transaction.id = `tx-${i}-${Math.random().toString(36).substr(2, 9)}`;
        
        // If we don't have a transaction type yet, default to 'unknown'
        if (!transaction.type) {
          transaction.type = 'unknown';
        }
        
        // Ensure we have a date field, even if it's just the row number
        if (!transaction.date) {
          transaction.date = `Row ${i + 1}`;
          transaction.originalDate = `Row ${i + 1}`;
        }
        
        // Add to transactions
        transactions.push(transaction);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error("Error parsing Excel directly:", error);
    throw error;
  }
}

/**
 * Extract tabular data from Excel binary
 * Uses pattern matching to find potential table structures
 */
function extractTabularDataFromBinary(data: Uint8Array): string[][] {
  // This is a simplified approach - we'll try to find repeating patterns 
  // that might represent rows and columns
  
  // Find sequences of text separated by zero bytes (common in Excel)
  let textSegments: string[] = [];
  let currentSegment = '';
  
  for (let i = 0; i < data.length - 1; i++) {
    // Look for potential text characters (printable ASCII)
    if ((data[i] >= 32 && data[i] < 127) && data[i+1] === 0) {
      // UTF-16LE encoded text found (common in Excel)
      const char = String.fromCharCode(data[i]);
      currentSegment += char;
    } else if (currentSegment.length > 0) {
      // End of a segment
      textSegments.push(currentSegment);
      currentSegment = '';
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length > 0) {
    textSegments.push(currentSegment);
  }
  
  // Filter out very short segments and duplicates
  textSegments = [...new Set(textSegments)].filter(s => s.length > 2);
  
  // Try to organize segments into potential rows and columns
  // This is a very simplified approach and won't work for all Excel files
  const rows: string[][] = [];
  let currentRow: string[] = [];
  
  for (const segment of textSegments) {
    // Heuristic: if segment contains a number or date-like pattern, 
    // it might be part of table data
    if (/\d/.test(segment)) {
      currentRow.push(segment);
      
      // Heuristic: after collecting several cells, start a new row
      if (currentRow.length >= 4) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    } else if (segment.length > 15 && currentRow.length > 0) {
      // Long text segment with previous data in the row - might be a description
      currentRow.push(segment);
      rows.push([...currentRow]);
      currentRow = [];
    }
  }
  
  // Add any remaining row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Find the most likely header row in table data
 */
function findHeaderRowIndex(rows: string[][]): number {
  // Look for common header terms in the first few rows
  const headerKeywords = ['date', 'description', 'amount', 'balance', 'debit', 'credit', 'type', 'ref'];
  
  // Only check the first 10 rows
  const rowsToCheck = Math.min(10, rows.length);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row) continue;
    
    // Count how many header keywords are found in this row
    let keywordMatches = 0;
    for (const cell of row) {
      for (const keyword of headerKeywords) {
        if (cell.toLowerCase().includes(keyword)) {
          keywordMatches++;
          break;
        }
      }
    }
    
    // If we found multiple header keywords in this row, it's likely the header
    if (keywordMatches >= 2) {
      return i;
    }
  }
  
  // Fallback: use the first row
  return 0;
}
