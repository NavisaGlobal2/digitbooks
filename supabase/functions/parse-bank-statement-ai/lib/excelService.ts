
import { isExcelFile as isExcelFileFn } from "./utils.ts";

/**
 * Service for handling Excel file operations
 */
export const ExcelService = {
  /**
   * Extract text content from an Excel file
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      console.log(`Extracting text from Excel file: ${file.name} (${file.size} bytes)`);
      
      // Get the binary data from the file
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      console.log(`Attempting to extract text from ${arrayBuffer.byteLength} bytes of Excel binary data`);
      
      // Extract text using multiple strategies for better coverage
      const textSegments: string[] = [];
      
      try {
        // 1. Extract ASCII text
        const asciiText = extractASCIIStrings(data);
        console.log(`Extracted ${asciiText.length} ASCII text segments`);
        
        if (asciiText.length > 0) {
          textSegments.push(...asciiText);
        }
      } catch (err) {
        console.log("ASCII extraction error:", err.message);
      }
      
      try {
        // 2. Extract UTF-16 text
        const utf16Text = extractUTF16Strings(data);
        console.log(`Extracted ${utf16Text.length} UTF16 text segments`);
        
        if (utf16Text.length > 0) {
          textSegments.push(...utf16Text);
        }
      } catch (err) {
        console.log("UTF-16 extraction error:", err.message);
      }
      
      try {
        // 3. Look for structured data patterns
        const structuredData = findStructuredData(data);
        console.log(`Extracted ${structuredData.length} structured data segments`);
        
        if (structuredData.length > 0) {
          textSegments.push(...structuredData);
        }
      } catch (err) {
        console.log("Structured data extraction error:", err.message);
      }
      
      // Filter out irrelevant text segments and prioritize important segments
      const filteredSegments = textSegments
        .filter(segment => segment.trim().length > 0)
        .filter(segment => {
          // Filter out common Excel internal strings
          const lowerSegment = segment.toLowerCase();
          return !lowerSegment.includes("microsoft excel") &&
                !lowerSegment.includes("worksheets") &&
                !lowerSegment.includes("<html") &&
                !lowerSegment.includes("<!doctype") &&
                !lowerSegment.includes("<xml") &&
                segment.length > 2; // Filter out very short segments
        });
      
      console.log(`Found ${filteredSegments.length} text segments in Excel file`);
      
      // Format the extracted text
      let textContent = `[EXCEL FILE: ${file.name}]\n\n`;
      
      // Log extraction stats
      const asciiCount = textSegments.filter(s => !containsUnicode(s)).length;
      const utf16Count = textSegments.filter(s => containsUnicode(s)).length;
      const structuredCount = textSegments.length - asciiCount - utf16Count;
      
      console.log(`Extracted segments - UTF16: ${utf16Count}, ASCII: ${asciiCount}, Structured: ${structuredCount}`);
      
      // Add table headers section specifically designed to help LLM recognize column structures
      textContent += "DETECTED TABLE STRUCTURE:\n";
      
      // Find potential headers - look for rows with short text items that might be column headers
      const potentialHeaders = findPotentialHeaders(filteredSegments);
      if (potentialHeaders.length > 0) {
        textContent += "Headers: " + potentialHeaders.join(" | ") + "\n\n";
      }
      
      // Add transaction data section
      textContent += "TRANSACTION DATA:\n";
      
      // Find rows that look like transactions (contain dates, numbers, etc.)
      const transactionRows = findTransactionRows(filteredSegments);
      
      // Add all identified transaction rows
      textContent += transactionRows.join("\n");
      
      // Add all remaining text segments that might be relevant
      // Focus on segments that might contain transaction data
      const remainingRelevantSegments = filteredSegments
        .filter(segment => 
          !transactionRows.includes(segment) && 
          !potentialHeaders.includes(segment) &&
          (containsDate(segment) || containsCurrency(segment) || containsTransactionWords(segment))
        );
      
      if (remainingRelevantSegments.length > 0) {
        textContent += "\n\nADDITIONAL RELEVANT DATA:\n";
        textContent += remainingRelevantSegments.join("\n");
      }
      
      console.log(`Final extracted text contains ${textContent.length} characters`);
      return textContent;
    } catch (error) {
      console.error('Error extracting text from Excel file:', error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Check if a file is an Excel file
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (file: File): boolean => {
  return isExcelFileFn(file.name, file.type);
};

// Helper function to extract ASCII strings from binary data
function extractASCIIStrings(data: Uint8Array): string[] {
  const minLength = 4; // Minimum length for a string to be considered valid
  const strings: string[] = [];
  let currentString = '';
  
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    // Check if it's a printable ASCII character
    if (byte >= 32 && byte <= 126) {
      currentString += String.fromCharCode(byte);
    } else {
      // End of current string
      if (currentString.length >= minLength) {
        strings.push(currentString);
      }
      currentString = '';
    }
  }
  
  // Add the last string if it's valid
  if (currentString.length >= minLength) {
    strings.push(currentString);
  }
  
  return strings;
}

// Helper function to extract UTF-16 strings from binary data
function extractUTF16Strings(data: Uint8Array): string[] {
  const minLength = 2; // Minimum length for a string to be considered valid
  const strings: string[] = [];
  let currentString = '';
  
  for (let i = 0; i < data.length - 1; i += 2) {
    // Create a UTF-16 character from two bytes
    const charCode = data[i] + (data[i + 1] << 8);
    
    // Check if it's a printable character
    if (charCode >= 32 && charCode <= 65535 && charCode !== 65533) {
      try {
        const char = String.fromCharCode(charCode);
        currentString += char;
      } catch (e) {
        // Skip invalid character
        if (currentString.length >= minLength) {
          strings.push(currentString);
        }
        currentString = '';
      }
    } else {
      // End of current string
      if (currentString.length >= minLength) {
        strings.push(currentString);
      }
      currentString = '';
    }
  }
  
  // Add the last string if it's valid
  if (currentString.length >= minLength) {
    strings.push(currentString);
  }
  
  return strings;
}

// Helper function to find structured data patterns in binary data
function findStructuredData(data: Uint8Array): string[] {
  const results: string[] = [];
  
  // Look for patterns indicating tables or structured data
  const dataStr = new TextDecoder().decode(data);
  
  // Simple pattern for CSV-like data in Excel files
  const csvPattern = /([^\n,]+,){3,}[^\n,]+/g;
  const csvMatches = dataStr.match(csvPattern);
  if (csvMatches) {
    results.push(...csvMatches);
  }
  
  // Look for tab-separated data
  const tsvPattern = /([^\n\t]+\t){3,}[^\n\t]+/g;
  const tsvMatches = dataStr.match(tsvPattern);
  if (tsvMatches) {
    results.push(...tsvMatches);
  }
  
  // Look for date patterns followed by numbers (typical for bank statements)
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}.{1,50}[\d,.]+/g;
  const dateMatches = dataStr.match(datePattern);
  if (dateMatches) {
    results.push(...dateMatches);
  }
  
  return results;
}

// Helper function to check if a string contains Unicode characters
function containsUnicode(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) return true;
  }
  return false;
}

// Helper function to find potential header rows
function findPotentialHeaders(segments: string[]): string[] {
  // Look for segments with potential column headers
  return segments.filter(segment => {
    // Headers often contain these words
    const headerKeywords = ['date', 'description', 'amount', 'balance', 'reference', 'transaction', 'debit', 'credit'];
    const lowerSegment = segment.toLowerCase();
    
    // Check if segment contains multiple header keywords
    return headerKeywords.filter(keyword => lowerSegment.includes(keyword)).length >= 2;
  });
}

// Helper function to find rows that look like transactions
function findTransactionRows(segments: string[]): string[] {
  // Look for segments that likely represent transaction rows
  return segments.filter(segment => {
    // Transaction rows typically have dates and amounts
    return containsDate(segment) && containsCurrency(segment);
  });
}

// Helper function to check if a string contains a date pattern
function containsDate(str: string): boolean {
  // Common date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.)
  const dateRegex = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
  return dateRegex.test(str);
}

// Helper function to check if a string contains currency/amount pattern
function containsCurrency(str: string): boolean {
  // Look for currency symbols or numbers with decimal points that might represent amounts
  const currencyRegex = /[\$£€₦]?\s?\d{1,3}(,\d{3})*(\.\d{2})?|\d+\.\d{2}/;
  return currencyRegex.test(str);
}

// Helper function to check if a string contains words commonly found in transactions
function containsTransactionWords(str: string): boolean {
  const lowerStr = str.toLowerCase();
  const transactionWords = ['payment', 'transfer', 'deposit', 'withdrawal', 'purchase', 'fee', 'interest', 'balance', 'statement'];
  return transactionWords.some(word => lowerStr.includes(word));
}
