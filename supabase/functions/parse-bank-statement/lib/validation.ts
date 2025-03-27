
// File validation utilities

/**
 * Maximum allowed file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * List of supported file extensions
 */
export const SUPPORTED_FILE_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

/**
 * List of supported MIME types
 */
export const SUPPORTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/csv',
  'application/x-csv',
  'text/x-csv',
  'text/comma-separated-values',
  'application/excel'
];

/**
 * Validates if the provided file type/extension is supported
 */
export function isValidFileType(file: File): boolean {
  // Check by extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = SUPPORTED_FILE_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );
  
  // Check by MIME type
  const hasValidMimeType = SUPPORTED_MIME_TYPES.includes(file.type);
  
  return hasValidExtension || hasValidMimeType;
}

/**
 * Validates if the file size is under the allowed limit
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Performs all validations on a file
 * @returns An error message if validation fails, or null if validation passes
 */
export function validateFile(file: File): string | null {
  if (!file) {
    return 'No file provided';
  }
  
  if (!isValidFileSize(file)) {
    return `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  
  if (!isValidFileType(file)) {
    return 'Unsupported file type. Please upload CSV or Excel files only';
  }
  
  return null;
}
