import { sanitizeTextForAPI } from "./utils.ts";

/**
 * Service for extracting content from Excel files
 */
export const ExcelService = {
  /**
   * Extract text content from an Excel file by parsing the binary data
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      console.log(`Extracting text from Excel file: ${file.name} (${file.size} bytes)`);
      
      // Get the binary data from the file and convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      // Convert to base64
      const base64Data = uint8ArrayToBase64(data);
      
      // Use the improved extraction function
      const extractedText = await extractTextFromExcel(base64Data, file.name);
      
      console.log(`Successfully extracted text content of length: ${extractedText.length} characters`);
      
      return sanitizeTextForAPI(extractedText);
    } catch (error) {
      console.error("Error extracting text from Excel file:", error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Helper function to extract text from Excel files
 * @param base64Data The base64 encoded Excel file data
 * @param fileName The name of the Excel file
 * @returns Promise with the extracted text content
 */
const extractTextFromExcel = async (base64Data: string, fileName: string): Promise<string> => {
  try {
    console.log("Processing Excel file:", fileName);
    
    // Clean the base64 string
    const cleanBase64 = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Convert base64 to binary array
    const data = base64ToUint8Array(cleanBase64);
    
    // Since we don't have XLSX in Deno, we'll need to parse the binary data manually
    // This is a simplified approach to extract text from Excel binary data
    
    let extractedText = `[EXCEL FILE: ${fileName}]\n\n`;
    extractedText += "DETECTED TABLE STRUCTURE:\nTRANSACTION DATA:\n";
    
    // Extract ASCII text segments
    const textSegments = extractTextSegments(data);
    
    // Look for tabular data patterns
    const tableData = extractTabularData(data, textSegments);
    
    // Add table data if found
    if (tableData.length > 0) {
      for (const row of tableData) {
        extractedText += row.join("\t") + "\n";
      }
    } else {
      // If no structured data found, include the text segments
      extractedText += "\n\nADDITIONAL RELEVANT DATA:\n";
      extractedText += textSegments.join("\n");
    }

    console.log("Excel extraction complete");
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from Excel:", error);
    throw new Error(`Failed to extract text from Excel: ${error.message}`);
  }
};

/**
 * Helper function to convert base64 to Uint8Array
 * @param base64 The base64 string to convert
 * @returns Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Helper function to convert Uint8Array to base64
 * @param bytes The Uint8Array to convert
 * @returns base64 string
 */
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Extract text segments from binary data
 * @param data The binary data
 * @returns Array of text segments
 */
const extractTextSegments = (data: Uint8Array): string[] => {
  const segments: string[] = [];
  let currentSegment = '';
  
  for (let i = 0; i < data.length; i++) {
    // Only consider printable ASCII characters
    if (data[i] >= 32 && data[i] < 127) {
      currentSegment += String.fromCharCode(data[i]);
    } else if (currentSegment.length > 0) {
      // End of segment
      if (currentSegment.length >= 3 && isRelevantTextSegment(currentSegment)) {
        segments.push(currentSegment);
      }
      currentSegment = '';
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length >= 3 && isRelevantTextSegment(currentSegment)) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Check if a text segment is relevant for financial data
 * @param segment The text segment to check
 * @returns boolean indicating if segment is relevant
 */
const isRelevantTextSegment = (segment: string): boolean => {
  // Ignore segments that are just repeated characters
  if (/^(.)\1+$/.test(segment)) return false;
  
  // Financial data often includes these words
  const financialKeywords = [
    'date', 'amount', 'transaction', 'payment', 'transfer', 'balance', 
    'debit', 'credit', 'deposit', 'withdrawal', 'reference'
  ];
  
  // Check if segment contains any financial keywords
  for (const keyword of financialKeywords) {
    if (segment.toLowerCase().includes(keyword)) return true;
  }
  
  // Check for date patterns
  if (/\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}/.test(segment)) return true;
  
  // Check for currency values
  if (/[\$€£¥]\s?\d+[.,]\d{2}/.test(segment) || /\d+[.,]\d{2}\s?[\$€£¥]/.test(segment)) return true;
  
  // General check - keep if it has numbers and letters (likely meaningful content)
  return /\d/.test(segment) && /[a-zA-Z]/.test(segment) && segment.length > 5;
}

/**
 * Extract tabular data from binary data
 * @param data The binary data
 * @param textSegments Text segments already extracted
 * @returns 2D array of tabular data
 */
const extractTabularData = (data: Uint8Array, textSegments: string[]): string[][] => {
  const table: string[][] = [];
  
  // Try to find patterns that might indicate table structures
  let potentialHeader: string[] = [];
  
  // Look for segments that might be headers
  for (const segment of textSegments) {
    if (segment.toLowerCase().includes('date') && 
        (segment.toLowerCase().includes('description') || 
         segment.toLowerCase().includes('transaction') || 
         segment.toLowerCase().includes('detail'))) {
      
      // This segment might contain header information
      const parts = segment.split(/[\t,;|]/);
      if (parts.length > 1) {
        potentialHeader = parts;
        break;
      }
    }
  }
  
  // If we found a potential header, add it to the table
  if (potentialHeader.length > 0) {
    table.push(potentialHeader);
    
    // Now try to find rows that match this pattern
    for (const segment of textSegments) {
      // Skip the header itself
      if (segment === potentialHeader.join('\t')) continue;
      
      // Look for segments with similar structure
      const parts = segment.split(/[\t,;|]/);
      if (parts.length >= potentialHeader.length - 1 && parts.length <= potentialHeader.length + 1) {
        table.push(parts);
      }
    }
  }
  
  return table;
}

/**
 * Check if a file is an Excel file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return mimeType.includes("excel") || 
         mimeType.includes("spreadsheet") ||
         fileName.endsWith('.xls') || 
         fileName.endsWith('.xlsx') || 
         fileName.endsWith('.ods');
};
