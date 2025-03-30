// src/hooks/useStatementUpload.ts - This is an example implementation for using OCR.space
import { useState, useCallback } from "react";
import { parseStatementFile, ParsedTransaction } from "../components/expenses/upload/parsers";
import { parseViaEdgeFunction } from "../components/expenses/upload/parsers/edge-function";
import { toast } from "sonner";
import { useStatementProcessor } from "./useStatementProcessor";
import { useProcessingState } from "./useProcessingState";
import { useUploadProgress } from "./useUploadProgress";
import { useStatementAuth } from "./useStatementAuth";
import { useFileValidation } from "./useFileValidation";

interface StatementUploadHookProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  storePdfInSupabase?: boolean;
  extractPdfText?: boolean;
  setIsProcessingPdf?: (isProcessing: boolean) => void;
  useOcrSpace?: boolean;
}

export const useStatementUpload = ({ 
  onTransactionsParsed,
  storePdfInSupabase = false,
  extractPdfText = false,
  setIsProcessingPdf,
  useOcrSpace = false
}: StatementUploadHookProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForServer, setIsWaitingForServer] = useState<boolean>(false);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");
  const [useVisionApi, setUseVisionApi] = useState<boolean>(true);

  // isAuthenticated is correctly typed as boolean | null from useStatementAuth
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
    stopProcessing: () => setUploading(false),
    storePdfInSupabase,
    extractPdfText,
    setIsProcessingPdf,
    useOcrSpace
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
    const authErrorMessage = await verifyAuth();
    if (authErrorMessage) {
      setError(authErrorMessage);
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
    
    // Pass isAuthenticated as boolean, ensuring it's not null with !!
    // This fixes the type error by explicitly converting to boolean
    await processStatement(file, preferredAIProvider, !!isAuthenticated, useVisionApi);
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

  const processStatement = useCallback(async (file: File, preferredAIProvider: string, isAuthenticated: boolean, useVisionApi: boolean) => {
    startProcessing();
    setError(null);
    startProgress();
    setCancelled(false);
    
    try {
      if (!isAuthenticated) {
        const authErrorMessage = await verifyAuth();
        if (authErrorMessage) {
          setError(authErrorMessage);
          stopProcessing();
          resetProgress();
          return;
        }
      }
      
      // Set isProcessingPdf if handling a PDF file
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      if (isPdf && setIsProcessingPdf) {
        setIsProcessingPdf(true);
      }
      
      // Log which OCR method is being used for PDF files
      if (isPdf) {
        if (useOcrSpace) {
          toast.info("Processing PDF using OCR.space. This may take a moment...");
          console.log("🔍 Using OCR.space for PDF processing");
        } else if (extractPdfText) {
          toast.info("Processing PDF using Google Vision API. This may take a moment...");
          console.log("🔍 Using Google Vision API for PDF processing");
        } else {
          toast.info("Processing PDF. This may take a moment...");
        }
      }
      
      // Process the file via the edge function
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          // Reset processing flag
          if (isPdf && setIsProcessingPdf) {
            setIsProcessingPdf(false);
          }
          
          // Handle success
          stopProcessing();
          completeProgress();
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          // Reset processing flag
          if (isPdf && setIsProcessingPdf) {
            setIsProcessingPdf(false);
          }
          
          // Handle error
          setError(errorMessage);
          stopProcessing();
          resetProgress();
          return true;
        },
        {
          preferredProvider: preferredAIProvider,
          useVision: useVisionApi,
          context: "expense",
          storePdfInSupabase,
          extractPdfText,
          useOcrSpace // Pass the useOcrSpace flag to the edge function
        }
      );
    } catch (error: any) {
      // Reset processing flag for PDF files
      if (file.name.toLowerCase().endsWith('.pdf') && setIsProcessingPdf) {
        setIsProcessingPdf(false);
      }
      
      // Handle error
      setError(error.message || "An error occurred while processing the file");
      stopProcessing();
      resetProgress();
    }
  }, [startProcessing, stopProcessing, completeProgress, resetProgress, onTransactionsParsed, setError, storePdfInSupabase, extractPdfText, setIsProcessingPdf, useOcrSpace, verifyAuth, setCancelled, startProgress]);

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
    setUseVisionApi,
    useOcrSpace
  };
};
