
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
    if (fileType === 'csv') {
      // For CSV, we fall back to the raw text if our function failed
      return await file.text();
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      throw new Error(`Excel file processing failed. Please try again or use CSV format.`);
    } else {
      // For unsupported file types, throw an error
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
