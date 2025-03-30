
import { ExcelService, isExcelFile } from "./excelService.ts";
import { CSVService, isCSVFile } from "./csvService.ts";

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
      return await ExcelService.extractTextFromExcel(file);
    }
    
    // Handle CSV files
    if (isCSVFile(file)) {
      console.log("Detected CSV file, using CSV service");
      return await CSVService.extractTextFromCSV(file);
    }
    
    // Handle PDF files - PDF parsing should be done by other modules
    if (fileName.endsWith('.pdf')) {
      throw new Error("PDF extraction should be handled separately");
    }
    
    // Default case, treat as text
    try {
      const text = await file.text();
      console.log(`Extracted ${text.length} characters of text from file`);
      return text;
    } catch (textError) {
      throw new Error(`Could not extract text from file: ${textError.message}`);
    }
  } catch (error) {
    console.error("Error in extractTextFromFile:", error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
