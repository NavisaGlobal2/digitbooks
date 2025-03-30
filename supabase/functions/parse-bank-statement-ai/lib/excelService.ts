
/**
 * Service for handling Excel file operations in Edge Function context
 * Simplified version of the client-side service for Edge Function use
 */
export const ExcelService = {
  /**
   * Extract text content from an Excel file
   * This is a simplified version for edge function context
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      // For edge functions, we need to work with the raw file data
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Try to extract text content from Excel binary data
      // Since we can't use SheetJS directly in the edge function, we'll use
      // a simpler approach to find text patterns
      let textContent = `[EXCEL FILE: ${file.name}]\n\n`;
      
      // Extract any visible text from the binary data
      const textSegments = extractTextFromExcelBinary(bytes);
      if (textSegments.length > 0) {
        textContent += "Extracted Text Content:\n";
        textContent += textSegments.join('\n');
      }
      
      // Add specific instructions for bank statement parsing
      textContent += `\n\nThis is an Excel spreadsheet containing bank transaction data.
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates (convert to YYYY-MM-DD format if possible)
2. Transaction descriptions/narratives
3. Transaction amounts (use negative for debits/expenses)
4. Transaction types (debit or credit)

Format the response as a structured array of transaction objects.
`;
      
      return textContent;
    } catch (error) {
      console.error('Error extracting text from Excel file:', error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Attempt to extract text segments from Excel binary data
 * This is a simplified method that won't work perfectly, but should
 * extract some useful text from simple Excel files
 * @param data The binary data as Uint8Array
 * @returns Array of extracted text segments
 */
function extractTextFromExcelBinary(data: Uint8Array): string[] {
  const textSegments: string[] = [];
  let currentSegment = '';
  let inTextSegment = false;
  let currentChar = ''; // Initialize currentChar to avoid undefined reference
  
  // Look for text patterns in the binary data
  for (let i = 0; i < data.length - 1; i++) {
    // Look for potential text characters (printable ASCII)
    if ((data[i] >= 32 && data[i] < 127) && data[i+1] === 0) {
      // Possible UTF-16LE encoded text found (common in Excel)
      currentChar = String.fromCharCode(data[i]);
      
      // Check if it's a likely text character
      if (/[a-zA-Z0-9.,\-$€£\s\/:]/.test(currentChar)) {
        inTextSegment = true;
        currentSegment += currentChar;
      } else if (inTextSegment) {
        // End of text segment
        if (currentSegment.length > 3) { // Ignore very short segments
          textSegments.push(currentSegment.trim());
        }
        currentSegment = '';
        inTextSegment = false;
      }
    }
    
    // For standard ASCII text sections
    if (data[i] >= 32 && data[i] < 127 && data[i+1] !== 0) {
      currentChar = String.fromCharCode(data[i]);
      
      // Check if it looks like human-readable text
      if (/[a-zA-Z0-9.,\-$€£\s\/:]/.test(currentChar)) {
        if (!inTextSegment) {
          inTextSegment = true;
        }
        currentSegment += currentChar;
      } else if (inTextSegment) {
        // End of text segment
        if (currentSegment.length > 3) { // Ignore very short segments
          textSegments.push(currentSegment.trim());
        }
        currentSegment = '';
        inTextSegment = false;
      }
    }
    
    // Check for potential row boundaries
    if (inTextSegment && currentChar && (currentChar === '\n' || currentChar === '\r')) {
      if (currentSegment.length > 3) { // Ignore very short segments
        textSegments.push(currentSegment.trim());
      }
      currentSegment = '';
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length > 3) {
    textSegments.push(currentSegment.trim());
  }
  
  // Filter out duplicates and very short segments
  return [...new Set(textSegments)]
    .filter(segment => segment.length > 3)
    .filter(segment => {
      // Try to filter out binary junk that looks like text
      const wordCount = segment.split(/\s+/).length;
      const hasLetters = /[a-zA-Z]/.test(segment);
      return hasLetters && wordCount > 1;
    });
}

/**
 * Check if a file is an Excel file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
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
