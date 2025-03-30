
import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { sanitizeTextForAPI } from "./utils.ts";

/**
 * Process CSV content to extract a formatted text representation
 * suitable for AI processing
 * @param content Raw CSV content
 * @returns Formatted text content
 */
export async function processCSVContent(content: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid CSV content provided");
  }
  
  try {
    // Sanitize the content for better processing
    const sanitizedContent = sanitizeTextForAPI(content);
    
    // Parse the CSV
    const rows = await parseCSV(sanitizedContent);
    
    // Format as readable text
    let formattedText = "CSV DOCUMENT:\n\n";
    
    // Check if we have data
    if (rows.length === 0) {
      return formattedText + "No data found in CSV.";
    }
    
    // Add header row
    if (rows.length > 0) {
      formattedText += rows[0].join("\t") + "\n";
      formattedText += "-".repeat(40) + "\n";
    }
    
    // Add data rows
    for (let i = 1; i < rows.length; i++) {
      formattedText += rows[i].join("\t") + "\n";
    }
    
    return formattedText;
  } catch (error) {
    console.error("Error processing CSV content:", error);
    throw new Error(`Failed to process CSV content: ${error.message}`);
  }
}

/**
 * Check if the file is a CSV file based on its mime type or extension
 * @param file File object to check
 * @returns boolean
 */
export function isCSVFile(file: File): boolean {
  if (!file) {
    return false;
  }
  
  // Check by mime type
  if (file.type === 'text/csv') {
    return true;
  }
  
  // Check by extension
  const name = file.name || '';
  return name.toLowerCase().endsWith('.csv');
}
