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
      
      // Get the binary data from the file
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      // Process the binary data to extract text content
      console.log("Attempting to extract text from Excel binary data");
      
      // Extract different types of text from the Excel file
      const { textSegments, tableData } = await extractExcelContent(data);
      
      // Log what we found
      console.log(`Extracted ${textSegments.length} text segments and ${tableData.length} table rows`);
      
      // Combine the extracted content into a structured text format
      let textContent = `[EXCEL FILE: ${file.name}]\n\n`;
      
      // Add table data with proper headers if available
      if (tableData.length > 0) {
        console.log("Adding structured table data to output");
        textContent += "TRANSACTION DATA:\n";
        
        // Add headers if present
        if (tableData[0] && Array.isArray(tableData[0])) {
          textContent += tableData[0].join("\t") + "\n";
        }
        
        // Add data rows
        for (let i = 1; i < Math.min(tableData.length, 100); i++) {
          if (tableData[i] && Array.isArray(tableData[i])) {
            textContent += tableData[i].join("\t") + "\n";
          }
        }
      }
      
      // Add plain text content if table data is insufficient
      if (tableData.length < 2 && textSegments.length > 0) {
        textContent += "\n\nADDITIONAL RELEVANT DATA:\n";
        textContent += textSegments.slice(0, 100).join("\n");
      }
      
      console.log(`Final extracted text contains ${textContent.length} characters`);
      
      return textContent;
    } catch (error) {
      console.error("Error extracting text from Excel file:", error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Extract content from Excel binary data
 * @param data The binary data as Uint8Array
 * @returns Object containing text segments and table data
 */
async function extractExcelContent(data: Uint8Array): Promise<{ 
  textSegments: string[],
  tableData: string[][]
}> {
  const textSegments: string[] = [];
  const tableData: string[][] = [];
  
  try {
    // Try to extract text content based on common patterns in Excel files
    let inCell = false;
    let currentRow: string[] = [];
    let currentCell = "";
    
    // Extract ASCII text segments (basic text content)
    const asciiSegments = extractAsciiText(data);
    console.log(`Extracted ${asciiSegments.length} ASCII text segments`);
    textSegments.push(...asciiSegments);
    
    // Extract UTF-16 text segments (formatted text content)
    const utf16Segments = extractUtf16Text(data);
    console.log(`Extracted ${utf16Segments.length} UTF16 text segments`);
    textSegments.push(...utf16Segments);
    
    // Try to extract structured data by looking for patterns
    const structuredData = extractStructuredData(data);
    console.log(`Extracted ${structuredData.length} structured data segments`);
    
    // Convert structured data into table rows
    let currentTableRow: string[] = [];
    for (const item of structuredData) {
      if (item === "\n" || item === "\r\n") {
        if (currentTableRow.length > 0) {
          tableData.push([...currentTableRow]);
          currentTableRow = [];
        }
      } else {
        currentTableRow.push(item);
      }
    }
    
    // Add any remaining table row
    if (currentTableRow.length > 0) {
      tableData.push(currentTableRow);
    }
    
    // If we couldn't extract structured data, try to infer it from text segments
    if (tableData.length < 2) {
      console.log("No structured data found, trying to infer table structure from text segments");
      
      // Go through text segments and look for potential tabular data
      for (const segment of textSegments) {
        const lines = segment.split(/[\r\n]+/);
        for (const line of lines) {
          // Skip empty lines
          if (!line.trim()) continue;
          
          // Try to split by common delimiters
          const parts = line.split(/[\t,;|]+/);
          if (parts.length > 1) {
            tableData.push(parts);
          }
        }
      }
    }
    
    // Log extraction results
    console.log(`Extracted segments - UTF16: ${utf16Segments.length}, ASCII: ${asciiSegments.length}, Structured: ${structuredData.length}`);
    console.log(`Found ${textSegments.length} text segments in Excel file`);
    
    return { textSegments, tableData };
  } catch (error) {
    console.error("Error in extractExcelContent:", error);
    return { textSegments, tableData };
  }
}

/**
 * Extract ASCII text from binary data
 * @param data Binary data
 * @returns Array of ASCII text segments
 */
function extractAsciiText(data: Uint8Array): string[] {
  const segments: string[] = [];
  let currentSegment = "";
  
  for (let i = 0; i < data.length; i++) {
    // Only consider printable ASCII characters
    if (data[i] >= 32 && data[i] < 127) {
      currentSegment += String.fromCharCode(data[i]);
    } else if (currentSegment.length > 0) {
      // End of segment, save if it's meaningful
      if (currentSegment.length >= 3) {
        segments.push(currentSegment);
      }
      currentSegment = "";
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length >= 3) {
    segments.push(currentSegment);
  }
  
  return segments.filter(s => isRelevantTextSegment(s));
}

/**
 * Extract UTF-16 text from binary data
 * @param data Binary data
 * @returns Array of UTF-16 text segments
 */
function extractUtf16Text(data: Uint8Array): string[] {
  const segments: string[] = [];
  let currentSegment = "";
  
  for (let i = 0; i < data.length - 1; i++) {
    // Look for UTF-16LE pattern (ASCII char followed by zero byte)
    if (data[i] >= 32 && data[i] < 127 && data[i+1] === 0) {
      currentSegment += String.fromCharCode(data[i]);
      i++; // Skip the zero byte
    } else if (currentSegment.length > 0) {
      // End of segment, save if it's meaningful
      if (currentSegment.length >= 3) {
        segments.push(currentSegment);
      }
      currentSegment = "";
    }
  }
  
  // Add any remaining segment
  if (currentSegment.length >= 3) {
    segments.push(currentSegment);
  }
  
  return segments.filter(s => isRelevantTextSegment(s));
}

/**
 * Extract structured data segments from binary data
 * @param data Binary data
 * @returns Array of structured data segments
 */
function extractStructuredData(data: Uint8Array): string[] {
  const segments: string[] = [];
  
  // Look for Excel XML content which contains the worksheet data
  const content = new TextDecoder().decode(data);
  
  // Extract content from worksheet XML if present
  const worksheetMatches = content.match(/<worksheet[^>]*>.*?<\/worksheet>/gs);
  if (worksheetMatches) {
    for (const worksheet of worksheetMatches) {
      // Extract rows
      const rowMatches = worksheet.match(/<row[^>]*>.*?<\/row>/gs);
      if (rowMatches) {
        for (const row of rowMatches) {
          const rowData: string[] = [];
          
          // Extract cell values
          const cellMatches = row.match(/<c[^>]*>.*?<\/c>/gs);
          if (cellMatches) {
            for (const cell of cellMatches) {
              // Extract value
              const valueMatch = cell.match(/<v>(.*?)<\/v>/s);
              if (valueMatch) {
                rowData.push(valueMatch[1]);
              }
            }
          }
          
          if (rowData.length > 0) {
            segments.push(rowData.join("\t"));
            segments.push("\n");
          }
        }
      }
    }
  }
  
  // If we couldn't find XML content, look for string tables
  if (segments.length < 2) {
    const stringTableMatches = content.match(/<sst[^>]*>.*?<\/sst>/gs);
    if (stringTableMatches) {
      for (const table of stringTableMatches) {
        // Extract string values
        const stringMatches = table.match(/<si>.*?<\/si>/gs);
        if (stringMatches) {
          for (const str of stringMatches) {
            // Extract text value
            const textMatch = str.match(/<t>(.*?)<\/t>/s);
            if (textMatch) {
              segments.push(textMatch[1]);
            }
          }
        }
      }
    }
  }
  
  return segments;
}

/**
 * Check if a text segment is relevant for processing
 * @param segment The text segment to check
 * @returns boolean indicating if the segment is relevant
 */
function isRelevantTextSegment(segment: string): boolean {
  // Ignore segments that are just repeated characters or binary data
  if (/^(.)\1+$/.test(segment)) return false; 
  
  // Ignore segments that are mostly special characters
  const specialCharCount = (segment.match(/[^a-zA-Z0-9\s.,:\-$€£]/g) || []).length;
  if (specialCharCount > segment.length / 2) return false;
  
  // Financial data often includes words like these
  const financialKeywords = [
    'date', 'amount', 'transaction', 'payment', 'transfer', 'balance', 
    'debit', 'credit', 'deposit', 'withdrawal', 'reference'
  ];
  
  // Check if the segment contains any financial keywords
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
 * Check if a file is an Excel file based on extension and/or mime type
 * @param fileName File name to check
 * @param mimeType File MIME type to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (fileName: string, mimeType: string): boolean => {
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  
  // Check mime type
  if (excelMimeTypes.includes(mimeType)) {
    return true;
  }
  
  // Check file extension
  const lowercaseName = fileName.toLowerCase();
  return excelExtensions.some(ext => lowercaseName.endsWith(ext));
};
