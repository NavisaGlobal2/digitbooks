
// Import the services from correct paths
import { isExcelFile, ExcelService } from './excelService.ts';
import { isCSVFile, CSVService } from './csvService.ts';

/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Check file type by extension first
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    // Check if it's a CSV file
    if (isCSVFile(file)) {
      return await CSVService.extractTextFromCSV(file);
    }
    
    // Check if it's an Excel file
    if (isExcelFile(file)) {
      return await ExcelService.extractTextFromExcel(file);
    }
    
    // If we reach here, use the default file type handling
    if (fileType === 'pdf') {
      try {
        // For PDFs, we need to extract the text content
        const arrayBuffer = await file.arrayBuffer();
        
        // Convert array buffer to base64 for processing
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Return a better structured prompt for the AI to process
        return `[PDF CONTENT EXTRACTED FROM: ${file.name}]

This is a bank statement in PDF format that has been converted to text.
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates in the exact format shown (MM/DD/YYYY, DD/MM/YYYY, etc.)
2. Complete transaction descriptions including merchant names, reference numbers
3. Exact transaction amounts (use negative values for debits/withdrawals)
4. Transaction types (categorize as "debit" or "credit" based on amount and context)
5. Any account or reference numbers associated with transactions

Focus EXCLUSIVELY on extracting the tabular data of transactions with dates, descriptions, and amounts.
Ignore headers, footers, account summaries, and marketing content.
Format your response as a structured array of transaction objects with date, description, amount, and type fields.
`;
      } catch (error) {
        console.error("Error processing PDF:", error);
        throw new Error(`Failed to process PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (fileType === 'csv') {
      // For CSV, we fall back to the raw text if our function failed
      return await file.text();
    } else {
      // For unsupported file types, throw an error
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
