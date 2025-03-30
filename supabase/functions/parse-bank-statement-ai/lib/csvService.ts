
import { isCSVFile as isCSVFileFn } from "./utils.ts";

/**
 * Service for handling CSV file operations
 */
export const CSVService = {
  /**
   * Parse a CSV file and return the data as an array of arrays
   * @param file The CSV file to parse
   * @returns Promise with the parsed CSV data
   */
  parseCSV: async (file: File): Promise<string[][]> => {
    try {
      console.log(`Parsing CSV file: ${file.name}`);
      const text = await file.text();
      const lines = text.split(/\r\n|\n/);
      const result: string[][] = [];
      
      for (const line of lines) {
        // Handle quoted values properly (values that might contain commas)
        const row = parseCSVRow(line);
        if (row.length > 0) {
          result.push(row);
        }
      }
      
      console.log(`Parsed ${result.length} rows from CSV file`);
      return result;
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  /**
   * Extract text content from a CSV file
   * @param file The CSV file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromCSV: async (file: File): Promise<string> => {
    try {
      console.log(`Extracting text from CSV file: ${file.name}`);
      const csvData = await CSVService.parseCSV(file);
      let textContent = `[CSV FILE: ${file.name}]\n\n`;
      
      // Add all rows
      if (csvData.length > 0) {
        for (const row of csvData) {
          textContent += row.join('\t') + '\n';
        }
      } else {
        textContent += "Warning: No data rows found in the CSV file.\n";
      }
      
      // Add specific instructions for bank statement parsing
      textContent += `\nThis is a CSV spreadsheet containing bank transaction data.
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates (convert to YYYY-MM-DD format if possible)
2. Transaction descriptions/narratives
3. Transaction amounts (use negative for debits/expenses)
4. Transaction types (debit or credit)

Format the response as a structured array of transaction objects.
`;
      
      return textContent;
    } catch (error) {
      console.error('Error extracting text from CSV file:', error);
      throw new Error(`Failed to extract text from CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Helper function to parse a single CSV row respecting quotes
 * @param text The CSV row text
 * @returns Array of values from the row
 */
const parseCSVRow = (text: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Found delimiter, add current value to result
      result.push(current);
      current = '';
    } else {
      // Add character to current value
      current += char;
    }
  }
  
  // Add the last value
  result.push(current);
  return result;
};

/**
 * Check if a file is a CSV file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is a CSV file
 */
export const isCSVFile = (file: File): boolean => {
  return isCSVFileFn(file.name, file.type);
};
