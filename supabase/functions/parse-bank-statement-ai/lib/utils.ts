
/**
 * Utility functions
 */

/**
 * Check if a file is a CSV file based on type or name
 * @param file The file to check
 * @returns boolean indicating if the file is a CSV
 */
export function isCSVFile(file: File): boolean {
  try {
    if (!file || !file.name) {
      return false;
    }
    
    // First check content type
    if (file.type === 'text/csv') {
      return true;
    }
    
    // Then check extension if available
    const fileName = file.name;
    if (!fileName) {
      return false;
    }
    
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    const extension = parts[parts.length - 1];
    return extension?.toLowerCase() === 'csv';
  } catch (error) {
    console.error("Error in isCSVFile:", error);
    return false;
  }
}

/**
 * Check if a file is an Excel file based on type or name
 * @param file The file to check
 * @returns boolean indicating if the file is an Excel file
 */
export function isExcelFile(file: File): boolean {
  try {
    if (!file || !file.name) {
      return false;
    }
    
    // Check content type first
    if (file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return true;
    }
    
    // Then check extension if available
    const fileName = file.name;
    if (!fileName) {
      return false;
    }
    
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    const extension = parts[parts.length - 1];
    return extension?.toLowerCase() === 'xls' || extension?.toLowerCase() === 'xlsx';
  } catch (error) {
    console.error("Error in isExcelFile:", error);
    return false;
  }
}

/**
 * Check if a file is a PDF file based on type or name
 * @param file The file to check
 * @returns boolean indicating if the file is a PDF
 */
export function isPDFFile(file: File): boolean {
  try {
    if (!file || !file.name) {
      return false;
    }
    
    // Check content type first
    if (file.type === 'application/pdf') {
      return true;
    }
    
    // Then check extension if available
    const fileName = file.name;
    if (!fileName) {
      return false;
    }
    
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    const extension = parts[parts.length - 1];
    return extension?.toLowerCase() === 'pdf';
  } catch (error) {
    console.error("Error in isPDFFile:", error);
    return false;
  }
}

/**
 * Safely parse a file name to extract extension
 * @param fileName The file name to parse
 * @returns The file extension or empty string if not available
 */
export function getFileExtension(fileName: string | null | undefined): string {
  if (!fileName) {
    return '';
  }
  
  const parts = fileName.split('.');
  if (parts.length < 2) {
    return '';
  }
  
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Sanitize text before sending to API to prevent encoding issues
 * @param text Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeTextForAPI(text: string): string {
  if (!text) {
    return '';
  }
  
  // Replace problematic characters and encoding issues
  return text
    // Replace null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Replace unpaired surrogates with space
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, ' ')
    // Reduce multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
}
