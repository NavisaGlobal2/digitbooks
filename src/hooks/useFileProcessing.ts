import { useState } from "react";
import { toast } from "sonner";

export const useFileProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

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
      
      setProcessing(true);
      
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
      
      const fileType = file.name.split('.').pop()?.toLowerCase();
      setProcessingStatus(fileType === 'pdf' 
        ? "Extracting data from PDF statement..." 
        : "Processing statement data...");
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(true);
      }
      
      const provider = preferredProvider || preferredAIProvider;
      console.log(`Processing with preferred AI provider: ${provider}`);
      
      const options: Record<string, any> = {
        preferredProvider: provider
      };
      
      if (file.name.toLowerCase().endsWith('.pdf')) {
        options.useVision = true;
      }
      
      const { parseViaEdgeFunction } = await import("../components/expenses/upload/parsers/edge-function");
      
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          
          if (!Array.isArray(transactions) || transactions.length === 0) {
            if (setIsWaitingForServer) {
              setIsWaitingForServer(false);
            }
            setProcessing(false);
            setProcessingStatus(null);
            onError("No valid transactions found in the statement. Please try a different file or format.");
            resetProgress();
            return;
          }
          
          const processedTransactions = transactions.map(tx => {
            if (tx.date && typeof tx.date === 'string') {
              const dateObj = new Date(tx.date);
              if (!isNaN(dateObj.getTime())) {
                tx.date = dateObj.toISOString().split('T')[0];
              }
            }
            return tx;
          });
          
          console.log(`Received ${processedTransactions.length} transactions from server`);
          
          completeProgress();
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          setProcessing(false);
          setProcessingStatus(null);
          onSuccess(processedTransactions);
        },
        (errorMessage) => {
          if (isCancelled) return true;
          
          setProcessing(false);
          setProcessingStatus(null);
          
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          
          const isPdfRetryError = file.name.toLowerCase().endsWith('.pdf') && 
                                errorMessage.toLowerCase().includes('second attempt');
          
          if (isPdfRetryError) {
            toast.warning("PDF processing requires a second attempt. Please try again.");
          }
          
          return onError(errorMessage);
        },
        options
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      setProcessing(false);
      setProcessingStatus(null);
      
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
    setPreferredAIProvider,
    processingStatus
  };
};
