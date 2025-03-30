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
      
      console.log(`Extracting text from Excel file: ${file.name} (${bytes.length} bytes)`);
      
      // Extract text content from Excel binary data
      // Since we can't use SheetJS directly in the edge function, we'll use
      // a simpler approach to find text patterns
      let textContent = `[EXCEL FILE: ${file.name}]\n\n`;
      
      // Extract any visible text from the binary data
      const textSegments = extractTextFromExcelBinary(bytes);
      
      if (textSegments.length > 0) {
        console.log(`Found ${textSegments.length} text segments in Excel file`);
        textContent += "Extracted Text Content:\n";
        textContent += textSegments.join('\n');
      } else {
        console.log("No text segments extracted from Excel file");
        textContent += "Warning: Could not extract meaningful text from Excel file. The file may be in a complex format or encrypted.\n";
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
 * This is an improved method that attempts multiple strategies to extract text
 * @param data The binary data as Uint8Array
 * @returns Array of extracted text segments
 */
function extractTextFromExcelBinary(data: Uint8Array): string[] {
  console.log(`Attempting to extract text from ${data.length} bytes of Excel binary data`);
  
  // Try multiple extraction methods and use the best result
  const utf16Segments = extractUtf16Segments(data);
  const asciiSegments = extractAsciiSegments(data);
  const structuredSegments = attemptStructuredExtraction(data);
  
  console.log(`Extracted segments - UTF16: ${utf16Segments.length}, ASCII: ${asciiSegments.length}, Structured: ${structuredSegments.length}`);
  
  // Combine results, prioritizing structured extraction if it found anything meaningful
  let combinedSegments: string[] = [];
  
  if (structuredSegments.length > 5) {
    // If structured extraction found several rows, use it
    combinedSegments = structuredSegments;
  } else {
    // Otherwise, combine UTF16 and ASCII segments and remove duplicates
    combinedSegments = [...utf16Segments, ...asciiSegments];
    combinedSegments = [...new Set(combinedSegments)]; // Remove duplicates
  }
  
  // Filter out very short segments, common Excel boilerplate text, and other noise
  return combinedSegments
    .filter(segment => segment.length > 3)
    .filter(segment => {
      // Filter out common Excel application text that's not transaction data
      const lowerSegment = segment.toLowerCase();
      return !lowerSegment.includes('microsoft excel') && 
             !lowerSegment.includes('worksheet') &&
             !lowerSegment.includes('©') &&
             !lowerSegment.includes('copyright') &&
             !lowerSegment.includes('created with');
    })
    .filter(segment => {
      // Try to filter out binary junk that looks like text
      const wordCount = segment.split(/\s+/).length;
      const hasLetters = /[a-zA-Z]/.test(segment);
      const hasNumbers = /[0-9]/.test(segment);
      // Keep segments that have letters and either multiple words or numbers (likely transaction data)
      return hasLetters && (wordCount > 1 || hasNumbers);
    });
}

/**
 * Extract UTF-16LE encoded text segments (common in Excel)
 */
function extractUtf16Segments(data: Uint8Array): string[] {
  const segments: string[] = [];
  let currentSegment = '';
  let inTextSegment = false;
  
  // Look for UTF-16LE encoded text (low byte followed by zero byte)
  for (let i = 0; i < data.length - 1; i += 2) {
    if (data[i] >= 32 && data[i] < 127 && data[i+1] === 0) {
      const char = String.fromCharCode(data[i]);
      
      // Check if character is likely part of text content
      if (/[a-zA-Z0-9.,\-$€£\s\/:]/.test(char)) {
        inTextSegment = true;
        currentSegment += char;
      } else if (inTextSegment) {
        // Found a non-text character after text segment
        if (currentSegment.length > 3) {
          segments.push(currentSegment.trim());
        }
        currentSegment = '';
        inTextSegment = false;
      }
    } else if (inTextSegment) {
      // Non-UTF16 pair found during text segment
      if (currentSegment.length > 3) {
        segments.push(currentSegment.trim());
      }
      currentSegment = '';
      inTextSegment = false;
    }
    
    // Check for newlines to separate rows
    if (currentSegment.length > 0 && data[i] === 10 || data[i] === 13) {
      if (currentSegment.length > 3) {
        segments.push(currentSegment.trim());
      }
      currentSegment = '';
    }
  }
  
  // Add final segment if any
  if (currentSegment.length > 3) {
    segments.push(currentSegment.trim());
  }
  
  return segments;
}

/**
 * Extract ASCII text segments
 */
function extractAsciiSegments(data: Uint8Array): string[] {
  const segments: string[] = [];
  let currentSegment = '';
  let inTextSegment = false;
  
  // Look for ASCII text
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= 32 && data[i] < 127) {
      const char = String.fromCharCode(data[i]);
      
      // Check if character is likely part of text content
      if (/[a-zA-Z0-9.,\-$€£\s\/:]/.test(char)) {
        inTextSegment = true;
        currentSegment += char;
      } else if (inTextSegment) {
        // Found a non-text character after text segment
        if (currentSegment.length > 3) {
          segments.push(currentSegment.trim());
        }
        currentSegment = '';
        inTextSegment = false;
      }
    } else if (inTextSegment) {
      // Non-ASCII character found during text segment
      if (currentSegment.length > 3) {
        segments.push(currentSegment.trim());
      }
      currentSegment = '';
      inTextSegment = false;
    }
    
    // Check for newlines to separate rows
    if (currentSegment.length > 0 && (data[i] === 10 || data[i] === 13)) {
      if (currentSegment.length > 3) {
        segments.push(currentSegment.trim());
      }
      currentSegment = '';
    }
  }
  
  // Add final segment if any
  if (currentSegment.length > 3) {
    segments.push(currentSegment.trim());
  }
  
  return segments;
}

/**
 * Attempt to extract structured data (rows and columns)
 * This tries to detect patterns that might indicate spreadsheet structure
 */
function attemptStructuredExtraction(data: Uint8Array): string[] {
  const segments: string[] = [];
  const potentialRows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  
  for (let i = 0; i < data.length; i++) {
    // Look for printable ASCII
    if (data[i] >= 32 && data[i] < 127) {
      const char = String.fromCharCode(data[i]);
      currentCell += char;
      
      // Look for potential cell separators
      if (char === ',' || char === '\t' || char === ';') {
        if (currentCell.length > 1) {
          currentRow.push(currentCell.slice(0, -1).trim()); // Remove the separator
          currentCell = '';
        }
      }
      // Look for potential row separators
      else if (char === '\n' || char === '\r') {
        if (currentCell.length > 1) {
          currentRow.push(currentCell.slice(0, -1).trim()); // Remove the separator
        }
        
        if (currentRow.length > 0) {
          potentialRows.push([...currentRow]);
        }
        
        currentRow = [];
        currentCell = '';
      }
    } else {
      // Handle non-ASCII characters as potential separators
      if (currentCell.length > 0) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      }
      
      // Check for chunks of binary data that might indicate row boundaries
      if (i % 64 === 0 && currentRow.length > 0) {
        potentialRows.push([...currentRow]);
        currentRow = [];
      }
    }
  }
  
  // Add final row if exists
  if (currentCell.length > 0) {
    currentRow.push(currentCell.trim());
  }
  if (currentRow.length > 0) {
    potentialRows.push([...currentRow]);
  }
  
  // Convert rows to text segments, joining cells with tabs
  if (potentialRows.length > 0) {
    for (const row of potentialRows) {
      if (row.length > 0) {
        segments.push(row.join('\t'));
      }
    }
  }
  
  return segments;
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
