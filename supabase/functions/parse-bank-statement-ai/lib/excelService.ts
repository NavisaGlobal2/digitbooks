

import { sanitizeTextForAPI } from "./utils.ts";
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.18.12/package/xlsx.mjs';

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
      
      // Use the provided extraction function
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
    console.log("Server-side processing Excel file:", fileName);
    
    // Clean the base64 string
    const cleanBase64 = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Convert base64 to binary array
    const data = base64ToUint8Array(cleanBase64);
    
    try {
      // Parse the Excel file
      const workbook = XLSX.read(data, { type: 'array' });
      
      let extractedText = `EXCEL DOCUMENT: ${fileName}\n\n`;
      
      // Process each worksheet
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Add sheet name
        extractedText += `Sheet: ${sheetName}\n`;
        
        // Format data as table
        if (sheetData.length > 0) {
          // Filter out empty rows
          const nonEmptyRows = sheetData.filter((row: any[]) => 
            Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && cell !== '')
          );
          
          if (nonEmptyRows.length > 0) {
            // Convert data to string representation
            nonEmptyRows.forEach((row: any[]) => {
              if (Array.isArray(row)) {
                const rowText = row
                  .map(cell => cell !== undefined && cell !== null ? String(cell) : "")
                  .join("\t");
                if (rowText.trim()) {
                  extractedText += rowText + "\n";
                }
              }
            });
          } else {
            extractedText += "No data found in this sheet.\n";
          }
        } else {
          extractedText += "Empty sheet\n";
        }
        
        extractedText += "\n";
      });

      console.log("Excel extraction complete");
      return extractedText;
    } catch (xlsxError) {
      console.error("Error using XLSX library:", xlsxError);
      console.log("Falling back to basic binary text extraction");
      
      // If XLSX parsing fails, fall back to basic binary extraction
      return extractTextWithFallback(data, fileName);
    }
  } catch (error) {
    console.error("Error extracting text from Excel:", error);
    throw new Error(`Failed to extract text from Excel: ${error.message}`);
  }
};

/**
 * Helper function for fallback text extraction from binary data
 * @param data The Excel file binary data
 * @param fileName The name of the Excel file
 * @returns Extracted text
 */
const extractTextWithFallback = (data: Uint8Array, fileName: string): string => {
  // Extract text segments using simple binary extraction
  let extractedText = `EXCEL DOCUMENT: ${fileName}\n\n`;
  
  // Extract text segments
  const textSegments = extractTextSegments(data);
  
  // Look for tabular data patterns
  const tableData = extractTabularData(data, textSegments);
  
  // Add structured data if found
  if (tableData.length > 0) {
    extractedText += "STRUCTURED DATA:\n";
    for (const row of tableData) {
      extractedText += row.join("\t") + "\n";
    }
  } else {
    // If no structured data found, include the text segments
    extractedText += "EXTRACTED TEXT:\n";
    extractedText += textSegments
      .filter(segment => segment.length >= 3)
      .join("\n");
  }

  return extractedText;
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
      if (currentSegment.length >= 3) {
        segments.push(currentSegment);
      }
      currentSegment = '';
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length >= 3) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Extract tabular data from binary data
 * @param data The binary data
 * @param textSegments Text segments already extracted
 * @returns 2D array of tabular data
 */
const extractTabularData = (data: Uint8Array, textSegments: string[]): string[][] => {
  const table: string[][] = [];
  
  // Simplified approach: look for tab, comma, or pipe delimited content
  for (const segment of textSegments) {
    // Check if this segment might be a table row
    if (segment.includes('\t') || segment.includes(',') || segment.includes('|')) {
      let delimiter = '\t';
      if (segment.includes(',') && !segment.includes('\t')) delimiter = ',';
      if (segment.includes('|') && !segment.includes('\t') && !segment.includes(',')) delimiter = '|';
      
      const cells = segment.split(delimiter);
      if (cells.length >= 2) {
        table.push(cells.map(cell => cell.trim()));
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
  if (!file || !file.name) {
    return false;
  }
  
  const fileName = file.name.toLowerCase();
  const mimeType = file.type ? file.type.toLowerCase() : '';
  
  return mimeType.includes("excel") || 
         mimeType.includes("spreadsheet") ||
         fileName.endsWith('.xls') || 
         fileName.endsWith('.xlsx') || 
         fileName.endsWith('.ods');
};
