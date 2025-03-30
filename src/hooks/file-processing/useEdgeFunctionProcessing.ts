
import { useState } from "react";
import { toast } from "sonner";

export const useEdgeFunctionProcessing = () => {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const handleEdgeFunctionSuccess = (
    transactions: any[], 
    onSuccess: (processedTxs: any[]) => void,
    setIsWaitingForServer?: (isWaiting: boolean) => void,
    setProcessing?: (isProcessing: boolean) => void
  ) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      if (setProcessing) {
        setProcessing(false);
      }
      setProcessingStatus(null);
      return false;
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
    
    if (setIsWaitingForServer) {
      setIsWaitingForServer(false);
    }
    if (setProcessing) {
      setProcessing(false);
    }
    setProcessingStatus(null);
    onSuccess(processedTransactions);
    
    return true;
  };
  
  const handleEdgeFunctionError = (
    errorMessage: string,
    file: File,
    isCancelled: boolean,
    onError: (errorMessage: string) => boolean,
    setIsWaitingForServer?: (isWaiting: boolean) => void,
    setProcessing?: (isProcessing: boolean) => void
  ) => {
    if (isCancelled) return true;
    
    if (setProcessing) {
      setProcessing(false);
    }
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
  };

  return {
    processingStatus,
    setProcessingStatus,
    handleEdgeFunctionSuccess,
    handleEdgeFunctionError
  };
};
