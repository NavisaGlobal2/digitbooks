
import { useUploadError } from "./useUploadError";

export const useFileValidation = () => {
  const { setError } = useUploadError();
  
  const validateFile = (file: File | null, isAuthenticated: boolean | null): boolean => {
    if (!file) {
      return false;
    }
    
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
      setError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
      return false;
    }
    
    // Check file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum file size is 10MB.');
      return false;
    }
    
    // If not authenticated, warn the user
    if (!isAuthenticated) {
      setError('Processing requires authentication. Please sign in to use this feature.');
      return false;
    }
    
    return true;
  };

  return { validateFile };
};
