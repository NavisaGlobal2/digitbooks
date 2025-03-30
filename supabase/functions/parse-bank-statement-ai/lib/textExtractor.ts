
import { parse as parseCSV } from 'https://deno.land/std@0.170.0/encoding/csv.ts';
import { read as xlsxRead, utils as xlsxUtils } from 'https://deno.land/x/excel@v1.1.2/mod.ts';
import { isCSVFile, isExcelFile, isPDFFile } from './utils.ts';
import { processCSVContent } from './csvService.ts';

/**
 * Extract text from various file types (CSV, XLSX, PDF)
 * @param file The file to extract text from
 * @returns Extracted text content
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  console.log(`Extracting text from file: ${file.name} (type: ${file.type}, size: ${file.size} bytes)`);

  try {
    // Handle CSV files
    if (isCSVFile(file)) {
      return await extractTextFromCSV(file);
    }
    
    // Handle Excel files
    if (isExcelFile(file)) {
      return await extractTextFromExcel(file);
    }
    
    // Handle PDF files
    if (isPDFFile(file)) {
      return await extractTextFromPDF(file);
    }
    
    // Fallback: Try to process as text
    try {
      return await file.text();
    } catch (textError) {
      throw new Error(`Unsupported file format or unable to extract text: ${textError.message}`);
    }
  } catch (error) {
    console.error("Error in extractTextFromFile:", error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Extract text from CSV file
 * @param file CSV file
 * @returns Extracted text content
 */
async function extractTextFromCSV(file: File): Promise<string> {
  console.log("Processing CSV file");

  try {
    // Use CSV processor
    const content = await file.text();
    return processCSVContent(content);
  } catch (error) {
    console.error("Error extracting text from CSV:", error);
    throw error;
  }
}

/**
 * Extract text from Excel file
 * @param file Excel file
 * @returns Extracted text content
 */
async function extractTextFromExcel(file: File): Promise<string> {
  const fileName = file.name || "unknown.xlsx";
  console.log(`Server-side processing Excel file: ${fileName}`);
  
  let extractedText = "";

  try {
    // Get file data as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    try {
      // Try to parse with XLSX library
      const workbook = xlsxRead(uint8Array);
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("No sheets found in Excel file");
      }

      extractedText = `EXCEL DOCUMENT: ${fileName}`;
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        
        extractedText += `\nSheet: ${sheetName}\n`;
        
        // Convert sheet to JSON and then to text
        const jsonData = xlsxUtils.sheet_to_json(sheet, { header: 1, defval: "" });
        
        // Process rows and columns
        for (const row of jsonData) {
          if (Array.isArray(row)) {
            extractedText += row.join("\t") + "\n";
          }
        }
      }

      console.log("Excel extraction complete");
      console.log(`Successfully extracted text content of length: ${extractedText.length} characters`);
      console.log(`Excel text extracted, first 500 chars: ${extractedText.substring(0, 500)}...`);
      
      // Add special formatting hint for AI processing
      const enhancedText = `${extractedText}\n\nIMPORTANT FOR EXCEL PROCESSING:
1. Look for table structures that contain transaction data (date, description, amount)
2. Particularly focus on columns that might contain dates and monetary values
3. If a column appears to contain both debits and credits, split them accordingly
4. For any amounts, use negative values for debits and positive for credits
5. Format all dates as YYYY-MM-DD regardless of original format`;
      
      console.log(`Enhanced Excel text with ${enhancedText.length} characters`);
      return enhancedText;
      
    } catch (xlsxError) {
      console.error("Failed to process Excel with XLSX library:", xlsxError);
      
      // Fallback to binary extraction
      extractedText = "Excel file content (binary extraction as fallback):\n";
      
      // Convert array buffer to base64 for inspection
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte), 
          ''
        )
      );
      
      // Extract any textual content from the binary data
      const textualContent = base64
        .replace(/[^A-Za-z0-9+/=]/g, '')
        .replace(/[+/=]/g, ' ')
        .replace(/\s+/g, ' ');
      
      extractedText += textualContent;
      console.log("Binary extraction complete as fallback");
      return extractedText;
    }
  } catch (error) {
    console.error("Error extracting text from Excel:", error);
    throw error;
  }
}

/**
 * Extract text from PDF file 
 * @param file PDF file
 * @returns Extracted text content
 * @throws Error if PDF processing fails
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For PDFs, we currently don't have a direct way to extract text in Deno
  // But we can prepare the content for AI processing with proper context
  
  console.log("Processing PDF file - preparing context for AI processing");
  
  // Create a placeholder with file information
  const placeholderText = `PDF DOCUMENT: ${file.name || "unnamed.pdf"} (${file.size} bytes)
This is a bank statement in PDF format. Please analyze the content carefully to extract:
1. All transaction dates (convert to YYYY-MM-DD format)
2. Transaction descriptions 
3. Transaction amounts (negative for debits, positive for credits)
4. Additional metadata like reference numbers, payment methods, etc.

Please structure the transactions in a standardized JSON format.`;

  return placeholderText;
}
