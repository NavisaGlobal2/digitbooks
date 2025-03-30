
import { ExcelService, isExcelFile } from "./excelService.ts";
import { CSVService, isCSVFile } from "./csvService.ts";
import { sanitizeTextForAPI } from "./utils.ts";

/**
 * Extract text from a file based on its type
 * @param file The file to extract text from
 * @returns Promise with the extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileName = file.name.toLowerCase();
    console.log(`Extracting text from file: ${fileName} (type: ${file.type}, size: ${file.size} bytes)`);
    
    // Handle Excel files
    if (isExcelFile(file)) {
      console.log("Detected Excel file, using Excel service");
      let excelText = await ExcelService.extractTextFromExcel(file);
      
      // Log a sample of what was extracted to debug
      console.log(`Excel text extracted, first 500 chars: ${excelText.substring(0, 500)}...`);
      
      // Add specific instructions for bank statement parsing
      excelText = excelText + `\n\nThis is an Excel spreadsheet containing bank transaction data.
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates (convert to YYYY-MM-DD format if possible)
2. Transaction descriptions/narratives (include ALL relevant details)
3. Transaction amounts (use negative for debits/expenses, positive for credits/deposits)
4. Transaction types (categorize as "debit" for money going out or "credit" for money coming in)

Only extract actual transactions, ignoring headers, footers, and non-transaction data.
If there's a column that appears to be a reference number or transaction ID, include it in the description.
If dates are in a different format (like DD/MM/YYYY), please standardize to YYYY-MM-DD.

Format the response as a JSON array of transaction objects with the structure:
[
  {
    "date": "YYYY-MM-DD", 
    "description": "Full transaction description", 
    "amount": 123.45, 
    "type": "debit|credit"
  }
]`;
      
      console.log(`Enhanced Excel text with ${excelText.length} characters`);
      
      // Sanitize text to ensure it doesn't have any problematic characters
      return sanitizeTextForAPI(excelText);
    }
    
    // Handle CSV files
    if (isCSVFile(fileName, file.type)) {
      console.log("Detected CSV file, using CSV service");
      const csvText = await CSVService.extractTextFromCSV(file);
      
      // Log a sample of what was extracted to debug
      console.log(`CSV text extracted, first 500 chars: ${csvText.substring(0, 500)}...`);
      
      console.log(`Enhanced CSV text with ${csvText.length} characters`);
      return csvText; // Already sanitized in CSVService
    }
    
    // Handle PDF files - PDF parsing should be done by other modules
    if (fileName.endsWith('.pdf')) {
      throw new Error("PDF extraction should be handled separately");
    }
    
    // Default case, treat as text
    try {
      let text = await file.text();
      console.log(`Extracted ${text.length} characters of text from file`);
      
      // Add basic instruction for generic files
      text += `\n\nPlease extract any financial transactions from this document.`;
      
      return sanitizeTextForAPI(text);
    } catch (textError) {
      throw new Error(`Could not extract text from file: ${textError.message}`);
    }
  } catch (error) {
    console.error("Error in extractTextFromFile:", error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
