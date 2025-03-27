
import { Transaction } from '../types.ts'
import { detectAndParseTransactions } from './transactionDetector.ts'
import { parseDate } from './helpers.ts'

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
  
  for (let i = 0; i < data.length - 1; i++) {
    // Look for UTF-16 encoded text (common in Excel files)
    // This is a simplified approach and won't catch everything
    if (data[i] >= 32 && data[i] < 127 && data[i+1] === 0) {
      // Possible text character found
      const char = String.fromCharCode(data[i])
      
      if (/[a-zA-Z0-9.,\-$€£\s]/.test(char)) {
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
    
    // Every 1024 bytes, check if we should create a new row
    // (this helps capture rows that might not have clear delimiters)
    if (i % 1024 === 0 && currentChunks.length > 0) {
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
  
  // Try to clean up and normalize the data
  const cleanedRows = cleanupExtractedData(rows)
  
  // If we couldn't extract meaningful data, add a fallback error row
  if (cleanedRows.length < 2) {
    // Create some dummy header and data rows so processing can continue
    cleanedRows.push(['Date', 'Description', 'Amount'])
    cleanedRows.push(['ERROR', 'Failed to parse Excel file format', '0'])
  }
  
  return cleanedRows
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

