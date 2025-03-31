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
    console.log("Found headers:", headers);
    
    // Process rows after the header
    const transactions = [];
    
    for (let i = headerRowIndex + 1; i < tableData.length; i++) {
      const row = tableData[i];
      
      // Skip empty rows
      if (row.filter(Boolean).length === 0) continue;
      
      // Create transaction object by mapping row to headers
      const transaction: Record<string, any> = {};
      let hasData = false;
      
      for (let j = 0; j < headers.length; j++) {
        if (j < row.length) {
          // Store original header name and value
          const headerName = headers[j]?.toString().trim() || `column${j}`;
          const cellValue = row[j];
          
          // Store every original field from Excel with original name
          const originalFieldName = `original_${headerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          transaction[originalFieldName] = cellValue;
          
          // Attempt to map to standard field names while preserving originals
          const lowerHeader = headerName.toLowerCase();
          
          // Map standard fields but preserve original values
          if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
            transaction.date = cellValue; // Keep original date format
            transaction.originalDate = cellValue; // Store original date separately
            hasData = true;
          } 
          else if (lowerHeader.includes('desc') || lowerHeader.includes('narr') || 
                  lowerHeader.includes('part') || lowerHeader.includes('det')) {
            transaction.description = cellValue;
            hasData = true;
          }
          else if (lowerHeader.includes('amount') || lowerHeader.includes('value') || 
                  lowerHeader.includes('sum') || lowerHeader.includes('debit') || 
                  lowerHeader.includes('credit')) {
            
            // Keep original amount format but try to convert to number for processing
            let numValue: number | null = null;
            
            // First preserve original amount
            transaction.originalAmount = cellValue;
            
            // Then try to convert to number for internal use if needed
            if (typeof cellValue === 'number') {
              numValue = cellValue;
            } else if (typeof cellValue === 'string' && cellValue.trim()) {
              // Try to parse amount, preserving negative signs
              const cleanedAmount = cellValue.replace(/[^\d.-]/g, '');
              if (cleanedAmount) {
                numValue = parseFloat(cleanedAmount);
              }
            }
            
            if (numValue !== null && !isNaN(numValue)) {
              transaction.amount = numValue;
              
              // Infer type but don't override explicit type if found later
              if (!transaction.type) {
                transaction.type = numValue < 0 ? 'debit' : 'credit';
              }
              hasData = true;
            }
          }
          // Explicitly look for transaction type indicators
          else if (lowerHeader.includes('type') || lowerHeader.includes('dr/cr')) {
            transaction.type = cellValue;
            hasData = true;
          }
        }
      }
      
      // Only add if we found some valid data
      if (hasData) {
        // Generate a unique ID
        transaction.id = `tx-${i}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Ensure required fields exist with defaults only if missing
        if (!transaction.date) {
          transaction.date = `Row ${i + 1}`;
          transaction.originalDate = `Row ${i + 1}`;
        }
        
        if (!transaction.description) {
          transaction.description = `Transaction from row ${i + 1}`;
        }
        
        if (transaction.amount === undefined) {
          transaction.amount = 0;
        }
        
        if (!transaction.type) {
          transaction.type = 'unknown';
        }
        
        // Add all original column data as a preservedColumns property
        transaction.preservedColumns = {};
        for (let j = 0; j < headers.length && j < row.length; j++) {
          const header = headers[j]?.toString().trim() || `column${j}`;
          transaction.preservedColumns[header] = row[j];
        }
        
        transactions.push(transaction);
      }
    }
    
    console.log(`Successfully extracted ${transactions.length} transactions with original data preserved`);
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
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let rowCount = 0;
  
  // More sophisticated approach to detect table structures
  for (let i = 0; i < textSegments.length; i++) {
    const segment = textSegments[i];
    
    // Check if this might be a new row marker
    const isNewRowMarker = segment.includes('\n') || 
                           segment.includes('\r') ||
                           (i > 0 && (segment.match(/^\d+$/) || segment.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)));
                           
    if (isNewRowMarker && currentRow.length > 0) {
      rows.push([...currentRow]);
      currentRow = [];
      rowCount++;
      currentRow.push(segment);
    }
    else if (segment.match(/[\d.,\-+$£€¥]/)) {
      // If segment contains numbers or currency symbols, likely part of a table
      currentRow.push(segment);
      
      // Periodically check if we should start a new row
      if (currentRow.length > 5) { // If we've accumulated many cells, start a new row
        rows.push([...currentRow]);
        currentRow = [];
        rowCount++;
      }
    }
    else if (segment.length > 5) {
      // Longer text segments might be descriptions
      currentRow.push(segment);
      
      // If we already have some columns, this might be the end of a row
      if (currentRow.length > 2) {
        rows.push([...currentRow]);
        currentRow = [];
        rowCount++;
      }
    }
    else if (segment.trim().length > 0) {
      // Add other non-empty segments
      currentRow.push(segment);
    }
    
    // Safety check for max rows
    if (rowCount > 1000) {
      console.log("Reached maximum row count, truncating Excel processing");
      break;
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
  // Look for common header terms in the first 10 rows
  const headerKeywords = ['date', 'description', 'amount', 'balance', 
                          'debit', 'credit', 'type', 'ref', 'transaction',
                          'details', 'narrative'];
  
  // Only check the first 10 rows
  const rowsToCheck = Math.min(10, rows.length);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row) continue;
    
    // Count how many header keywords are found in this row
    let keywordMatches = 0;
    for (const cell of row) {
      if (!cell) continue;
      
      const cellLower = cell.toLowerCase();
      for (const keyword of headerKeywords) {
        if (cellLower.includes(keyword)) {
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
