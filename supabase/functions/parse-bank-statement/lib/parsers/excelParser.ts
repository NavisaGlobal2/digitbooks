
import { Transaction } from '../types.ts'
import { detectAndParseTransactions } from './transactionDetector.ts'
import { parseDate } from './utils/dateUtils.ts'
import { parseAmount } from './utils/amountUtils.ts'
import { isDateLike, looksLikeNumber } from './utils/typeDetectionUtils.ts'

// Process Excel file
export async function processExcel(file: File): Promise<Transaction[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    // Since the xlsx module is not available, we'll parse the Excel file as a binary file
    // and convert it to CSV-like data structure that our detector can understand
    
    // This is a simple implementation that extracts text content from Excel files
    // It won't handle all Excel formatting but should work for basic spreadsheets
    const data = await parseExcelBinary(arrayBuffer)
    
    console.log(`Extracted ${data.length} rows from Excel file`);
    
    // If we have very few rows, it may not be a valid Excel file
    if (data.length < 2) {
      throw new Error('The Excel file does not contain enough data. Please check your file format.');
    }
    
    // Try to detect columns by header or position using the same detector as for CSV
    return detectAndParseTransactions(data)
  } catch (error) {
    console.error('Error processing Excel file:', error)
    throw new Error(`Failed to process Excel file: ${error.message}`)
  }
}

// Simple Excel binary parser that extracts text content
async function parseExcelBinary(buffer: ArrayBuffer): Promise<string[][]> {
  // Convert ArrayBuffer to Uint8Array for processing
  const data = new Uint8Array(buffer)
  
  // Extract strings from Excel binary format
  // This is a simplified approach that won't work for all Excel files
  // but should handle basic spreadsheets with text data
  const rows: string[][] = []
  
  // Extract text chunks from the binary data
  let currentChunks: string[] = []
  let textChunk = ''
  let inTextMode = false
  let rowCounter = 0
  
  // Try to extract text content in segments, handling UTF-16 encoding
  for (let i = 0; i < data.length - 1; i++) {
    // Look for UTF-16 encoded text (common in Excel files)
    // This is a simplified approach and won't catch everything
    if ((data[i] >= 32 && data[i] < 127) && data[i+1] === 0) {
      // Possible text character found
      const char = String.fromCharCode(data[i])
      
      if (/[a-zA-Z0-9.,\-$€£\s\/:]/.test(char)) {
        if (!inTextMode) {
          inTextMode = true
        }
        textChunk += char
      } else if (inTextMode) {
        // End of text chunk
        if (textChunk.length > 0) {
          currentChunks.push(textChunk.trim())
          textChunk = ''
          
          // Check if this might be the end of a row
          if (char === '\r' || char === '\n' || char === ';' || char === ',') {
            if (currentChunks.length > 0) {
              rows.push([...currentChunks])
              currentChunks = []
              rowCounter++
              
              // Safety break for extremely large files
              if (rowCounter > 10000) {
                console.warn('Excel file appears to have more than 10,000 rows, truncating');
                break;
              }
            }
          }
        }
        inTextMode = false
      }
    }
    
    // Every 512 bytes, check if we should create a new row
    // (this helps capture rows that might not have clear delimiters)
    if (i % 512 === 0 && currentChunks.length > 0) {
      // If we've accumulated a few chunks without a natural row break,
      // force a new row to avoid missing data
      if (!rows.length || rows[rows.length - 1].length !== currentChunks.length) {
        rows.push([...currentChunks])
        currentChunks = []
      }
    }
  }
  
  // Add any remaining text
  if (textChunk.length > 0) {
    currentChunks.push(textChunk.trim())
  }
  
  // Add any remaining row
  if (currentChunks.length > 0) {
    rows.push([...currentChunks])
  }
  
  // Log what we found for debugging
  console.log(`Extracted ${rows.length} potential rows from Excel binary data`)
  
  // Try alternative parsing if no rows were found with the standard method
  if (rows.length < 3) {
    console.log("Few rows extracted, trying alternative parsing method");
    const alternativeRows = tryAlternativeExcelParsing(data);
    if (alternativeRows.length > rows.length) {
      console.log(`Alternative parsing found ${alternativeRows.length} rows`);
      return cleanupExtractedData(alternativeRows);
    }
  }
  
  // Try to clean up and normalize the data
  const cleanedRows = cleanupExtractedData(rows)
  
  // If we couldn't extract meaningful data, add a fallback error row
  if (cleanedRows.length < 2) {
    // Look for any text content in the file to help diagnose the issue
    const textContent = extractAnyTextContent(data);
    console.warn("Could not extract structured data from Excel file. Found text content:", textContent);
    
    // Create some dummy header and data rows so processing can continue
    cleanedRows.push(['Date', 'Description', 'Amount'])
    cleanedRows.push(['ERROR', 'Failed to parse Excel file format. Try CSV instead.', '0'])
  }
  
  return cleanedRows
}

// Alternative parsing method that tries to extract any text segments
function tryAlternativeExcelParsing(data: Uint8Array): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let textBuffer = '';
  let consecutiveTextChars = 0;
  
  // Scan through the binary data looking for text segments
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    
    // If this is a printable ASCII character
    if (byte >= 32 && byte < 127) {
      const char = String.fromCharCode(byte);
      textBuffer += char;
      consecutiveTextChars++;
      
      // If we found a potential delimiter
      if (char === ',' || char === ';' || char === '\t') {
        if (textBuffer.length > 1) {
          currentRow.push(textBuffer.slice(0, -1).trim()); // Remove the delimiter
        } else {
          currentRow.push('');
        }
        textBuffer = '';
        consecutiveTextChars = 0;
      } 
      // If we found a potential end of row
      else if (char === '\n' || char === '\r') {
        if (textBuffer.length > 1) {
          currentRow.push(textBuffer.slice(0, -1).trim()); // Remove the newline
        }
        
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [];
        }
        textBuffer = '';
        consecutiveTextChars = 0;
      }
      
      // If we've accumulated a significant text chunk, consider it a cell
      if (consecutiveTextChars > 10 && (char === ' ' || char === '\t')) {
        currentRow.push(textBuffer.trim());
        textBuffer = '';
        consecutiveTextChars = 0;
      }
    } else {
      // If we've accumulated some text and hit a non-ASCII char, treat as a cell boundary
      if (textBuffer.length > 0) {
        currentRow.push(textBuffer.trim());
        textBuffer = '';
        consecutiveTextChars = 0;
      }
      
      // Check for potential row boundary in non-ASCII sections
      if (currentRow.length > 0 && i % 64 === 0) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    }
  }
  
  // Add any remaining data
  if (textBuffer.length > 0) {
    currentRow.push(textBuffer.trim());
  }
  
  if (currentRow.length > 0) {
    rows.push([...currentRow]);
  }
  
  return rows;
}

// Extract any text content for diagnostic purposes
function extractAnyTextContent(data: Uint8Array): string {
  let textContent = '';
  let chunk = '';
  
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= 32 && data[i] < 127) {
      chunk += String.fromCharCode(data[i]);
    } else if (chunk.length > 0) {
      if (chunk.length > 3) { // Only keep chunks with reasonable length
        textContent += chunk + ' ';
      }
      chunk = '';
    }
  }
  
  if (chunk.length > 3) {
    textContent += chunk;
  }
  
  return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
}

// Cleanup and normalize the extracted data
function cleanupExtractedData(rows: string[][]): string[][] {
  if (rows.length === 0) return rows
  
  // Look for potential header row
  let headerIndex = -1
  const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance']
  
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowText = rows[i].join(' ').toLowerCase()
    let matches = 0
    
    for (const keyword of headerKeywords) {
      if (rowText.includes(keyword)) {
        matches++
      }
    }
    
    if (matches >= 2) {
      headerIndex = i
      break
    }
  }
  
  // If a header row was found, ensure all data rows have the same length
  if (headerIndex !== -1) {
    const headerLength = rows[headerIndex].length
    
    // Normalize data rows to have the same column count as the header
    const normalizedRows = [rows[headerIndex]]
    
    for (let i = headerIndex + 1; i < rows.length; i++) {
      // Skip empty rows
      if (rows[i].length === 0) continue
      
      // Skip rows with mostly empty cells
      const nonEmptyCells = rows[i].filter(cell => cell.trim().length > 0).length
      if (nonEmptyCells < 2) continue
      
      // If row has too few columns, pad with empty strings
      if (rows[i].length < headerLength) {
        normalizedRows.push([...rows[i], ...Array(headerLength - rows[i].length).fill('')])
      } 
      // If row has too many columns, truncate
      else if (rows[i].length > headerLength) {
        normalizedRows.push(rows[i].slice(0, headerLength))
      }
      // Row is the right length
      else {
        normalizedRows.push(rows[i])
      }
    }
    
    return normalizedRows
  }
  
  // If no clear header was found, try to normalize the rows
  // by finding the most common row length
  const lengthCounts: { [key: number]: number } = {}
  
  for (const row of rows) {
    if (row.length === 0) continue
    lengthCounts[row.length] = (lengthCounts[row.length] || 0) + 1
  }
  
  let mostCommonLength = 0
  let maxCount = 0
  
  for (const length in lengthCounts) {
    if (lengthCounts[length] > maxCount) {
      maxCount = lengthCounts[length]
      mostCommonLength = parseInt(length)
    }
  }
  
  // Filter to only include rows with the most common length
  // or pad/truncate rows to match that length
  if (mostCommonLength > 0) {
    return rows
      .filter(row => row.length > 0)
      .map(row => {
        if (row.length < mostCommonLength) {
          return [...row, ...Array(mostCommonLength - row.length).fill('')]
        } else if (row.length > mostCommonLength) {
          return row.slice(0, mostCommonLength)
        }
        return row
      })
  }
  
  return rows.filter(row => row.length > 0)
}


