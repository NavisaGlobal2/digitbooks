
/**
 * Utility functions for the bank statement parser
 */

/**
 * Check if a file is an Excel file based on filename and/or mime type
 * @param fileName The name of the file
 * @param fileType The MIME type of the file
 * @returns boolean indicating if the file is an Excel file
 */
export const isExcelFile = (fileName: string, fileType: string): boolean => {
  // Check file extension
  const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  const lowerFileName = fileName.toLowerCase();
  
  // Check MIME type
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
  ];
  
  return excelExtensions.some(ext => lowerFileName.endsWith(ext)) || 
         excelMimeTypes.includes(fileType);
};

/**
 * Check if a file is a CSV file based on filename and/or mime type
 * @param fileName The name of the file
 * @param fileType The MIME type of the file
 * @returns boolean indicating if the file is a CSV file
 */
export const isCSVFile = (fileName: string, fileType: string): boolean => {
  // Check file extension
  const csvExtensions = ['.csv'];
  const lowerFileName = fileName.toLowerCase();
  
  // Check MIME type
  const csvMimeTypes = [
    'text/csv',
    'application/csv', 
    'text/comma-separated-values',
    'application/vnd.ms-excel'  // Some CSV files are reported with Excel MIME type
  ];
  
  return csvExtensions.some(ext => lowerFileName.endsWith(ext)) || 
         csvMimeTypes.includes(fileType);
};

/**
 * Check if a file is a PDF file based on filename and/or mime type
 * @param fileName The name of the file
 * @param fileType The MIME type of the file
 * @returns boolean indicating if the file is a PDF file
 */
export const isPDFFile = (fileName: string, fileType: string): boolean => {
  // Check file extension
  const lowerFileName = fileName.toLowerCase();
  
  // Check MIME type
  return lowerFileName.endsWith('.pdf') || fileType === 'application/pdf';
};

/**
 * Format date strings consistently
 * @param dateStr The date string to format
 * @returns A formatted date string (YYYY-MM-DD) or the original if parsing fails
 */
export const formatDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return dateStr;
  }
};

/**
 * Clean and normalize text content
 * @param text The text to clean
 * @returns Cleaned text
 */
export const cleanText = (text: string): string => {
  if (!text) return '';
  
  // Remove multiple spaces, normalize line breaks
  return text.replace(/\s+/g, ' ').trim();
};
