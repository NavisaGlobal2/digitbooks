
import { useState, useCallback } from "react";
import { parseStatementFile, ParsedTransaction } from "../parsers";
import { useStatementProcessor } from "./useStatementProcessor";
import { useProcessingState } from "./useProcessingState";
import { useUploadProgress } from "./useUploadProgress";
import { useStatementAuth } from "./useStatementAuth";
import { useFileValidation } from "./useFileValidation";

interface StatementUploadHookProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
}

export const useStatementUpload = ({ onTransactionsParsed }: StatementUploadHookProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForServer, setIsWaitingForServer] = useState<boolean>(false);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");
  const [useVisionApi, setUseVisionApi] = useState<boolean>(true);

  const { isAuthenticated, verifyAuth } = useStatementAuth();
  const { validateFile } = useFileValidation();
  const { 
    progress, 
    step, 
    startProgress, 
    completeProgress, 
    resetProgress, 
    isCancelled, 
    setCancelled,
    cancelProgress 
  } = useUploadProgress();
  
  const onError = useCallback((errorMessage: string): boolean => {
    setError(errorMessage);
    setUploading(false);
    resetProgress();
    return true;
  }, [resetProgress]);
  
  const { processStatement } = useStatementProcessor({
    onTransactionsParsed,
    onError,
    startProgress,
    resetProgress,
    completeProgress,
    isCancelled,
    setIsWaitingForServer,
    startProcessing: () => setUploading(true),
    stopProcessing: () => setUploading(false)
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    
    // Validate the file format
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
  }, [validateFile]);

  const parseFile = useCallback(async () => {
    // Verify auth first
    const authError = await verifyAuth();
    if (authError) {
      setError(authError);
      return;
    }
    
    // Validate the file again just to be sure
    if (!file) {
      setError("Please select a bank statement file");
      return;
    }
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Process the file
    await processStatement(file, preferredAIProvider, isAuthenticated as boolean, useVisionApi);
  }, [file, verifyAuth, validateFile, processStatement, preferredAIProvider, isAuthenticated, useVisionApi]);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    resetProgress();
  }, [resetProgress]);

  const cancelUpload = useCallback(() => {
    setCancelled(true);
    setUploading(false);
    setIsWaitingForServer(false);
    resetProgress();
  }, [setCancelled, resetProgress]);

  return {
    file,
    uploading,
    error,
    handleFileChange,
    parseFile,
    clearFile,
    progress,
    step,
    cancelProgress: cancelUpload,
    isWaitingForServer,
    isAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider,
    useVisionApi,
    setUseVisionApi
  };
};
