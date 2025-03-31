
import { tryAlternativeExcelParsing, extractAnyTextContent } from './alternativeParsers.ts'
import { cleanupExtractedData } from './dataExtractor.ts'

// Simple Excel binary parser that extracts text content
export async function parseExcelBinary(buffer: ArrayBuffer): Promise<string[][]> {
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
