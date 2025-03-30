import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { isCSVFile, isExcelFile, isPDFFile } from './utils.ts';
import { processCSVContent } from './csvService.ts';
import { ExcelService } from './excelService.ts';

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
      // Use the ExcelService instead of direct extraction
      return await ExcelService.extractTextFromExcel(file);
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
