
import { useState } from "react";

export const useFileValidation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (selectedFile: File): boolean => {
    // Check file type
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
      setValidationError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
      return false;
    }
    
    // Check file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setValidationError('File is too large. Maximum file size is 10MB.');
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const incrementAttempts = () => {
    setProcessingAttempts(prev => prev + 1);
  };

  const clearFile = () => {
    setFile(null);
    setProcessingAttempts(0);
    setValidationError(null);
    
    // Clear PDF attempt counter from localStorage
    localStorage.removeItem('pdf_attempt_count');
  };

  return {
    file,
    setFile,
    processingAttempts,
    incrementAttempts,
    clearFile,
    validateFile,
    validationError,
    setValidationError
  };
};
