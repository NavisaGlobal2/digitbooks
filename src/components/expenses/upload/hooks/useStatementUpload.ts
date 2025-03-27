
import { useState } from "react";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useFileProcessing } from "./useFileProcessing";
import { useAuthenticationStatus } from "./useAuthenticationStatus";
import { useFileValidation } from "./useFileValidation";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Get authentication status
  const { isAuthenticated } = useAuthenticationStatus();

  // Get progress handling utilities
  const {
    progress,
    step,
    isCancelled,
    isWaitingForServer,
    setIsWaitingForServer,
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress
  } = useUploadProgress();

  // Get error handling utilities
  const {
    error,
    setError,
    handleError,
    clearError
  } = useUploadError();

  // Get file validation utilities
  const { validateFile } = useFileValidation();

  // Get file processing utilities
  const {
    processServerSide
  } = useFileProcessing({
    onTransactionsParsed,
    handleError,
    resetProgress,
    completeProgress,
    showFallbackMessage: () => {}, // We no longer need fallback processing
    isCancelled,
    setIsWaitingForServer
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      clearError();
      
      validateFile(selectedFile, isAuthenticated);
    }
  };

  const parseFile = async () => {
    if (!file) {
      handleError("Please select a bank statement file");
      return;
    }

    setUploading(true);
    clearError();

    try {
      // Start progress simulation
      startProgress();
      
      // If not authenticated, show error
      if (!isAuthenticated) {
        handleError("Processing requires authentication. Please sign in to use this feature.");
        resetProgress();
        setUploading(false);
        return;
      }
      
      await processServerSide(file);
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    clearError();
    setUploading(false);
    resetProgress();
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
    isAuthenticated
  };
};
