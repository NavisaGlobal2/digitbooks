import { isExcelFile as isExcelFileFn } from "./utils.ts";

/**
 * Service for handling Excel file operations
 */
export const ExcelService = {
  /**
   * Extract text from an Excel file
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      console.log(`Extracting text from Excel file: ${file.name} (${file.size} bytes)`);
      
      // Get file data as array buffer
      const buffer = await file.arrayBuffer();
      
      // Attempt to extract text using multiple methods and combine results
      let extractedText = '';
      let segments: { ascii: string[], utf16: string[], structured: any[] } = {
        ascii: [],
        utf16: [],
        structured: []
      };
      
      // Extract potential data from Excel binary
      try {
        const data = new Uint8Array(buffer);
        
        console.log(`Attempting to extract text from ${data.length} bytes of Excel binary data`);
        
        // 1. Extract ASCII text (most reliable for readable content)
        const asciiText = extractASCIIText(data);
        segments.ascii = asciiText;
        console.log(`Extracted ${asciiText.length} ASCII text segments`);
        
        // 2. Extract UTF-16 text (catches some additional formatted text)
        const utf16Text = extractUTF16Text(data);
        segments.utf16 = utf16Text;
        console.log(`Extracted ${utf16Text.length} UTF16 text segments`);
        
        // 3. Try to extract structured data patterns
        const structuredData = extractStructuredData(data);
        segments.structured = structuredData;
        console.log(`Extracted ${structuredData.length} structured data segments`);
        
        // Log the total number of segments found
        console.log(`Found ${asciiText.length + utf16Text.length + structuredData.length} text segments in Excel file`);
        
        // Combine extracted text with proper formatting
        extractedText = [
          `[EXCEL FILE: ${file.name}]`,
          '',
          'DETECTED TABLE STRUCTURE:',
          'TRANSACTION DATA:',
          ...asciiText.filter(t => isTransactionLike(t)),
          '',
          'ADDITIONAL RELEVANT DATA:',
          ...asciiText.filter(t => !isTransactionLike(t) && t.length > 3),
          ...utf16Text.filter(t => t.length > 3),
          ...structuredData.map(d => typeof d === 'string' ? d : JSON.stringify(d)).filter(t => t.length > 3)
        ].join('\n');
        
        console.log(`Extracted segments - UTF16: ${utf16Text.length}, ASCII: ${asciiText.length}, Structured: ${structuredData.length}`);
      } catch (binaryError) {
        console.error('Error extracting from binary data:', binaryError);
        extractedText = `Failed to extract binary data: ${binaryError.message}. ` + extractedText;
      }
      
      console.log(`Final extracted text contains ${extractedText.length} characters`);
      return extractedText;
    } catch (error) {
      console.error('Error extracting text from Excel file:', error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Helper function to determine if a text segment looks like transaction data
 * @param text The text segment to check
 * @returns boolean indicating if text looks like transaction data
 */
function isTransactionLike(text: string): boolean {
  // Check for common transaction indicators (dates, amounts with currency symbols, numbers)
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
  const amountPattern = /(?:£|\$|€|\d+\.\d{2}|\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  
  return (
    datePattern.test(text) || 
    amountPattern.test(text) ||
    /(debit|credit|payment|transfer|transaction|deposit|withdrawal)/i.test(text)
  );
}

/**
 * Extract ASCII text from binary data
 * @param data The binary data
 * @returns Array of extracted text segments
 */
function extractASCIIText(data: Uint8Array): string[] {
  const textSegments: string[] = [];
  let currentSegment = '';
  
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    
    // ASCII printable characters (32-126)
    if (byte >= 32 && byte <= 126) {
      currentSegment += String.fromCharCode(byte);
    } else if (byte === 10 || byte === 13) { // Line breaks
      currentSegment += ' ';
    } else {
      if (currentSegment.trim().length > 3) {
        textSegments.push(currentSegment.trim());
      }
      currentSegment = '';
    }
  }
  
  // Add the last segment if not empty
  if (currentSegment.trim().length > 3) {
    textSegments.push(currentSegment.trim());
  }
  
  return textSegments;
}

/**
 * Extract UTF-16 text from binary data
 * @param data The binary data
 * @returns Array of extracted text segments
 */
function extractUTF16Text(data: Uint8Array): string[] {
  const textSegments: string[] = [];
  
  // Process pairs of bytes as UTF-16
  for (let i = 0; i < data.length - 1; i += 2) {
    let currentSegment = '';
    let validChars = 0;
    
    for (let j = i; j < Math.min(i + 100, data.length - 1); j += 2) {
      const charCode = data[j] + (data[j + 1] << 8);
      
      // Check for printable characters
      if (charCode >= 32 && charCode <= 126 || charCode >= 160 && charCode <= 255) {
        currentSegment += String.fromCharCode(charCode);
        validChars++;
      } else {
        break;
      }
    }
    
    if (validChars > 3 && currentSegment.trim().length > 0) {
      textSegments.push(currentSegment.trim());
      i += validChars * 2 - 2; // Skip the characters we've processed
    }
  }
  
  return textSegments;
}

/**
 * Extract structured data patterns from binary data
 * @param data The binary data
 * @returns Array of structured data objects/strings
 */
function extractStructuredData(data: Uint8Array): any[] {
  const results: any[] = [];
  const text = new TextDecoder().decode(data);
  
  // Look for date patterns
  const dateMatches = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g);
  if (dateMatches) {
    results.push(...dateMatches);
  }
  
  // Look for currency/amount patterns
  const amountMatches = text.match(/(?:£|\$|€|\d+\.\d{2}|\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
  if (amountMatches) {
    results.push(...amountMatches);
  }
  
  return results;
}

/**
 * Check if a file is an Excel file
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (file: File): boolean => {
  const excelMimeTypes = [
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // Check mime type
  if (excelMimeTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
};
