
import { useRef } from "react";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useStatementAuth } from "./useStatementAuth";
import { useFileValidation } from "./useFileValidation";
import { useProcessingState } from "./useProcessingState";
import { useStatementProcessor } from "./useStatementProcessor";
import { toast } from "sonner";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const {
    isAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider
  } = useStatementAuth();

  const {
    file,
    setFile,
    processingAttempts,
    incrementAttempts,
    clearFile,
    validateFile,
    validationError,
    setValidationError
  } = useFileValidation();

  const {
    uploading,
    processingInProgress,
    startProcessing,
    stopProcessing,
    isProcessingFile
  } = useProcessingState();

  const {
    progress,
    step,
    isCancelled,
    isWaitingForServer,
    setIsWaitingForServer,
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress,
  } = useUploadProgress();

  const {
    error,
    setError,
    handleError,
    clearError
  } = useUploadError();

  const {
    processStatement
  } = useStatementProcessor({
    onTransactionsParsed,
    onError: handleError,
    startProgress,
    resetProgress,
    completeProgress,
    isCancelled,
    setIsWaitingForServer,
    startProcessing,
    stopProcessing
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event received");
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
      
      // Check if we're already processing a file
      if (processingInProgress) {
        console.log("Processing already in progress, ignoring new file selection");
        return;
      }
      
      clearError();
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
      
      // If not authenticated, warn the user
      if (!isAuthenticated) {
        setError('Processing requires authentication. Please sign in to use this feature.');
      }
    } else {
      console.log("No file selected in the event");
    }
  };

  const parseFile = async () => {
    // Prevent double processing
    if (processingInProgress) {
      console.log("Processing already in progress, ignoring duplicate request");
      return;
    }

    if (!file) {
      handleError("Please select a bank statement file");
      return;
    }
    
    // Check if we're already processing this exact file
    if (isProcessingFile(file)) {
      console.log("This exact file is already being processed, preventing duplicate processing");
      return;
    }

    clearError();
    incrementAttempts();
    
    try {
      // If not authenticated, show error
      if (!isAuthenticated) {
        handleError("Processing requires authentication. Please sign in to use this feature.");
        return;
      }
      
      console.log(`Starting file processing with edge function (Attempt #${processingAttempts + 1})`);
      
      await processStatement(file, preferredAIProvider, isAuthenticated);
      
    } catch (error: any) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
      stopProcessing();
    }
  };

  return {
    file,
    uploading,
    error,
    handleFileChange,
    parseFile,
    clearFile,
    // Progress related
    progress,
    step,
    isWaitingForServer,
    cancelProgress,
    isAuthenticated,
    // AI provider selection
    preferredAIProvider,
    setPreferredAIProvider
  };
};
