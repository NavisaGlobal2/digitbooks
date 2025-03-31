
// Alternative parsing method that tries to extract any text segments
export function tryAlternativeExcelParsing(data: Uint8Array): string[][] {
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
export function extractAnyTextContent(data: Uint8Array): string {
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
