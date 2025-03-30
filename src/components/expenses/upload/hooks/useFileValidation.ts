
import { useCallback } from "react";

export const useFileValidation = () => {
  const validateFile = useCallback((file: File): string | null => {
    // Check if the file is present
    if (!file) {
      return "No file selected";
    }
    
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['csv', 'xlsx', 'xls', 'pdf'];
    
    const isValidMimeType = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ].includes(file.type);
    
    if (!isValidMimeType && !validExts.includes(fileExt || '')) {
      return "Please upload a CSV, Excel, or PDF file";
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return "File is too large. Maximum size is 10MB";
    }
    
    return null; // No errors
  }, []);

  return {
    validateFile
  };
};
