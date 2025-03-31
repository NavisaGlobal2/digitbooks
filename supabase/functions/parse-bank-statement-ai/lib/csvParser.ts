import { CSVService } from './csvService.ts';

/**
 * Directly parse a CSV file to preserve its structure similar to Excel parsing
 * @param file The CSV file to parse
 * @returns Promise with array of transactions with preserved structure
 */
export async function parseCSVDirectly(file: File): Promise<any[]> {
  try {
    console.log('Using direct CSV parsing to preserve exact original data structure');
    
    // Extract the text content from the CSV file
    const csvText = await CSVService.extractTextFromCSV(file);
    
    if (!csvText || typeof csvText !== 'string' || csvText.trim() === '') {
      throw new Error('Empty or invalid CSV content');
    }
    
    // Split the CSV into lines
    const lines = csvText.replace(/\r\n/g, '\n').split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    if (nonEmptyLines.length < 2) { // At least header + one data row
      throw new Error('CSV file has insufficient data');
    }
    
    console.log(`CSV file has ${nonEmptyLines.length} non-empty lines`);
    
    // Parse CSV into structured rows while preserving all original data
    const parsedRows = [];
    
    // Keep track of headers for mapping
    const headers = parseCSVRow(nonEmptyLines[0]);
    console.log('CSV headers:', headers);
    
    // Process each row
    for (let i = 0; i < nonEmptyLines.length; i++) {
      const rowValues = parseCSVRow(nonEmptyLines[i]);
      
      // Create a transaction object with preserved structure
      const transaction = {
        id: `csv-row-${i}`,
        date: new Date().toISOString(), // Default date that will be improved by AI formatting
        description: null,
        amount: 0,
        type: "unknown",
        originalDate: null,
        originalAmount: null,
        originalDescription: null,
        originalType: null,
        preservedColumns: {}
      };
      
      // Preserve the original column values
      headers.forEach((header, index) => {
        if (index < rowValues.length) {
          transaction.preservedColumns[header] = rowValues[index];
        }
      });
      
      parsedRows.push(transaction);
    }
    
    console.log(`Successfully parsed ${parsedRows.length} rows directly from CSV`);
    console.log('Sample parsed row:', parsedRows.length > 1 ? JSON.stringify(parsedRows[1], null, 2).substring(0, 200) + '...' : 'No sample available');
    
    return parsedRows;
  } catch (error) {
    console.error('Error in direct CSV parsing:', error);
    throw new Error(`Failed to parse CSV directly: ${error.message}`);
  }
}

/**
 * Parse a single CSV row into an array of values, respecting quotes
 * @param line The CSV line to parse
 * @returns Array of values from the CSV row
 */
function parseCSVRow(line: string): string[] {
  if (!line) return [];
  
  const result = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    // Handle quotes
    if (char === '"') {
      // Check if it's an escaped quote
      if (i + 1 < line.length && line[i + 1] === '"') {
        currentField += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    
    // Handle field separators
    if (char === ',' && !inQuotes) {
      result.push(currentField);
      currentField = '';
      continue;
    }
    
    // Add character to current field
    currentField += char;
  }
  
  // Add the last field
  result.push(currentField);
  
  return result;
}
