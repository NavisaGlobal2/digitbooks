
/**
 * Service for handling CSV file operations in Edge Function context
 * Simplified version of the client-side service
 */
export const CSVService = {
  /**
   * Extract text content from a CSV file
   * @param file The CSV file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromCSV: async (file: File): Promise<string> => {
    try {
      return await file.text();
    } catch (error) {
      console.error("Error extracting text from CSV:", error);
      throw new Error("Failed to extract text from CSV file");
    }
  }
};

/**
 * Check if a file is a CSV file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is a CSV file
 */
export const isCSVFile = (file: File): boolean => {
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    return true;
  }
  
  // Check mime type
  const csvMimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel', // Some systems use this for CSV too
    'text/plain' // Some browsers/systems may use this for CSV
  ];
  
  return csvMimeTypes.includes(file.type);
};
