
import { toast } from "sonner";

export const useFileValidation = () => {
  const processReceiptFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const receiptUrl = reader.result as string;
        resolve(receiptUrl);
      };
      
      reader.onerror = () => {
        toast.error("Failed to process receipt file");
        reject("Failed to process receipt file");
      };
    });
  };

  const processBankStatementFile = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const validateFileType = () => {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const validExts = ['csv', 'xlsx', 'xls', 'pdf'];
        
        const isValidMimeType = [
          'text/csv', 
          'application/vnd.ms-excel', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ].includes(file.type);
        
        return isValidMimeType || validExts.includes(fileExt || '');
      };
      
      if (!validateFileType()) {
        toast.error("Unsupported file format. Please upload CSV, Excel, or PDF files");
        reject("Unsupported file format");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB");
        reject("File too large");
        return;
      }
      
      try {
        resolve(file);
      } catch (err) {
        console.error('Error processing bank statement:', err);
        toast.error("Failed to process bank statement file");
        reject("Failed to process bank statement file");
      }
    });
  };

  return {
    processReceiptFile,
    processBankStatementFile
  };
};
