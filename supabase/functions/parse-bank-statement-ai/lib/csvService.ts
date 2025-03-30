
import { parse as parseCSV } from 'https://deno.land/std@0.170.0/encoding/csv.ts';

/**
 * Process CSV content and convert to structured text
 * @param content The CSV content as a string
 * @returns Processed text representation of the CSV
 */
export function processCSVContent(content: string): string {
  try {
    // Parse CSV to get rows and columns
    const rows = parseCSV(content);
    
    if (!rows || rows.length === 0) {
      return "Empty CSV file";
    }
    
    // Convert to a text representation
    let textContent = "CSV DOCUMENT:\n\n";
    
    // Check if we have headers
    const headers = rows[0];
    if (headers && headers.length > 0) {
      textContent += "Headers: " + headers.join(", ") + "\n\n";
    }
    
    // Add data rows
    textContent += "Data:\n";
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length > 0) {
        textContent += row.join(", ") + "\n";
      }
    }
    
    // Add some context for parsing
    textContent += "\nNOTE: This is a bank statement in CSV format. Please extract all transactions with dates, descriptions, and amounts.";
    
    return textContent;
  } catch (error) {
    console.error("Error processing CSV content:", error);
    
    // Fallback: Return the raw content with some context
    return "Failed to parse CSV structure. Raw content:\n\n" + content;
  }
}

/**
 * Check if a file is a CSV file based on file name or type
 * @param file The file to check
 * @returns boolean indicating if file is CSV
 */
export function isCSVFile(file: File): boolean {
  if (!file) {
    return false;
  }
  
  // Check MIME type if available
  if (file.type === 'text/csv') {
    return true;
  }
  
  // Check file extension as fallback
  const fileName = file.name;
  if (!fileName) {
    return false;
  }
  
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return false;
  }
  
  const extension = parts[parts.length - 1];
  return extension.toLowerCase() === 'csv';
}
