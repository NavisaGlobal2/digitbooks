
import { useState } from "react";
import { toast } from "sonner";

export const useFileProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");

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
      // Simple validation for file types
      const validTypes = [
        'text/csv', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf'
      ];
      
      // Check file extension as fallback
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['csv', 'xlsx', 'xls', 'pdf'];
      
      if (!validTypes.includes(file.type) && !validExts.includes(fileExt || '')) {
        toast.error("Unsupported file format. Please upload CSV, Excel, or PDF files");
        reject("Unsupported file format");
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB");
        reject("File too large");
        return;
      }
      
      setProcessing(true);
      
      // For bank statements, we don't need to read the content yet
      // Just validate and return the file
      try {
        resolve(file);
      } catch (err) {
        console.error('Error processing bank statement:', err);
        toast.error("Failed to process bank statement file");
        reject("Failed to process bank statement file");
      } finally {
        setProcessing(false);
      }
    });
  };

  // This is the function being used in useStatementUpload
  const processServerSide = async (file: File, 
    onSuccess: (transactions: any[]) => void, 
    onError: (errorMessage: string) => boolean,
    resetProgress: () => void,
    completeProgress: () => void,
    isCancelled: boolean,
    setIsWaitingForServer?: (isWaiting: boolean) => void,
    preferredProvider?: string
  ) => {
    try {
      setProcessing(true);
      
      // If we're waiting for server, update the UI
      if (setIsWaitingForServer) {
        setIsWaitingForServer(true);
      }
      
      // Now process with edge function
      const { parseViaEdgeFunction } = await import("../components/expenses/upload/parsers/edgeFunctionParser");
      
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          completeProgress();
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          setProcessing(false);
          onSuccess(transactions);
        },
        (errorMessage) => {
          if (isCancelled) return true;
          
          setProcessing(false);
          
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          
          // Call the provided error handler
          return onError(errorMessage);
        },
        preferredProvider || preferredAIProvider
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      setProcessing(false);
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file on server.");
      resetProgress();
    }
  };

  return {
    processing,
    error,
    processReceiptFile,
    processBankStatementFile,
    processServerSide,
    isAuthenticated,
    setIsAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider
  };
};
