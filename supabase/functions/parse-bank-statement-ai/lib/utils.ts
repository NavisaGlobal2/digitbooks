
/**
 * Utility functions for file parsing and processing
 */

/**
 * Check if a file is a CSV file based on extension and/or mime type
 * @param fileName File name to check
 * @param mimeType File MIME type to check
 * @returns boolean indicating if the file is a CSV file
 */
export const isCSVFile = (fileName: string, mimeType: string): boolean => {
  const csvMimeTypes = [
    'text/csv',
    'application/csv', 
    'application/vnd.ms-excel',
    'text/plain'
  ];
  
  // Check mime type
  if (csvMimeTypes.includes(mimeType)) {
    return true;
  }
  
  // Check file extension
  const lowercaseName = fileName.toLowerCase();
  return lowercaseName.endsWith('.csv');
};

/**
 * Check if a file is a PDF file based on extension and/or mime type
 * @param fileName File name to check 
 * @param mimeType File MIME type to check
 * @returns boolean indicating if the file is a PDF file
 */
export const isPDFFile = (fileName: string, mimeType: string): boolean => {
  // Check mime type
  if (mimeType === 'application/pdf') {
    return true;
  }
  
  // Check file extension
  const lowercaseName = fileName.toLowerCase();
  return lowercaseName.endsWith('.pdf');
};

/**
 * Format a date string to YYYY-MM-DD format
 * @param dateStr Date string in various formats
 * @returns Formatted date string or original if parsing fails
 */
export const formatDate = (dateStr: string): string => {
  try {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Handle DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    // Handle MM/DD/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    
    // Try generic date parsing as fallback
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateStr;
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return dateStr;
  }
};

/**
 * Clean text for AI processing by removing problematic characters
 * @param text Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeTextForAPI = (text: string): string => {
  // Replace problematic characters and encoding issues
  return text
    // Replace null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Replace unpaired surrogates with space
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, ' ')
    // Filter out other problematic Unicode characters
    .replace(/[\uFFFE\uFFFF\uFDD0-\uFDEF\uFDC0-\uFDCF]/g, ' ')
    // Reduce multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Clean currency values and convert to numeric format
 * @param value Currency value as string
 * @returns Cleaned numeric value
 */
export const cleanCurrencyValue = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove currency symbols and non-numeric characters (except for decimal point and minus sign)
  const cleaned = value.replace(/[^\d.,\-]/g, '')
    .replace(/,/g, '.') // Replace comma with dot for decimal
    .replace(/(\..*?)\..*$/, '$1'); // Keep only first decimal point
    
  return parseFloat(cleaned) || 0;
};
