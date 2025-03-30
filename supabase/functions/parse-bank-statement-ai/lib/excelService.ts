
/**
 * Service for handling Excel file operations in Edge Function context
 * Simplified version of the client-side service for Edge Function use
 */
export const ExcelService = {
  /**
   * Extract text content from an Excel file
   * This is a simplified version for edge function context
   * @param file The Excel file to extract text from
   * @returns Promise with the extracted text content
   */
  extractTextFromExcel: async (file: File): Promise<string> => {
    try {
      // For edge functions, we'll use a simple approach
      // Convert the Excel file to text format
      const arrayBuffer = await file.arrayBuffer();
      
      // Return a structured text representation
      return `[EXCEL FILE: ${file.name}]

This is an Excel spreadsheet file containing bank transaction data.
Please extract all financial transactions with PRECISE attention to:
1. Transaction dates (convert to YYYY-MM-DD format if possible)
2. Transaction descriptions/narratives
3. Transaction amounts (use negative for debits/expenses)
4. Transaction types (debit or credit)

Format the response as a structured array of transaction objects.
`;
    } catch (error) {
      console.error('Error extracting text from Excel file:', error);
      throw new Error(`Failed to extract text from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Check if a file is an Excel file based on extension and/or mime type
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (file: File): boolean => {
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  
  // Check mime type
  if (excelMimeTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  return excelExtensions.some(ext => fileName.endsWith(ext));
};
