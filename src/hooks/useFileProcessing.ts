
import { useState } from "react";
import { useProcessingState } from "./file-processing/useProcessingState";
import { useFileValidation } from "./file-processing/useFileValidation";
import { useServerProcessing } from "./file-processing/useServerProcessing";
import { useEdgeFunctionProcessing } from "./file-processing/useEdgeFunctionProcessing";
import { createProcessingOptions } from "./file-processing/utils/processingOptions";

export const useFileProcessing = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  
  const {
    processing, 
    setProcessing,
    error,
    setError,
    isAuthenticated,
    setIsAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider
  } = useProcessingState();
  
  const { processReceiptFile, processBankStatementFile } = useFileValidation();
  
  const { 
    isWaitingForServer,
    setIsWaitingForServer
  } = useServerProcessing();
  
  const { 
    processingStatus,
    setProcessingStatus,
    handleEdgeFunctionSuccess,
    handleEdgeFunctionError
  } = useEdgeFunctionProcessing();

  const processServerSide = async (file: File, 
    onSuccess: (transactions: any[]) => void, 
    onError: (errorMessage: string) => boolean,
    resetProgress: () => void,
    completeProgress: () => void,
    isCancelled: boolean,
    setIsWaitingForServer?: (isWaiting: boolean) => void,
    options?: any
  ) => {
    try {
      setProcessing(true);
      
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const isPdf = fileType === 'pdf';
      setProcessingStatus(isPdf 
        ? "Extracting data from PDF statement..." 
        : "Processing statement data...");
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(true);
      }
      
      // Create processing options with imported utility function
      const processingOptions = createProcessingOptions(preferredAIProvider, fileType, options);
      
      console.log("Processing options:", processingOptions);
      
      const { parseViaEdgeFunction } = await import("../components/expenses/upload/parsers/edge-function");
      
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          
          completeProgress();
          
          handleEdgeFunctionSuccess(
            transactions, 
            onSuccess,
            setIsWaitingForServer,
            setProcessing
          );
        },
        (errorMessage) => {
          return handleEdgeFunctionError(
            errorMessage,
            file,
            isCancelled,
            onError,
            setIsWaitingForServer,
            setProcessing
          );
        },
        processingOptions
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
    processingStatus,
    isWaitingForServer,
    setIsWaitingForServer,
    isCancelled,
    setIsCancelled
  };
};
