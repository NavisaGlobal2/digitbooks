
// src/hooks/useStatementUpload.ts - This is an example implementation for using OCR.space
import { useState, useCallback } from "react";
import { parseStatementFile, ParsedTransaction } from "../components/expenses/upload/parsers";
import { parseViaEdgeFunction } from "../components/expenses/upload/parsers/edge-function";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

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
  const [progress, setProgress] = useState<number>(0);
  const [step, setStep] = useState<string>('idle');
  const [isCancelled, setCancelled] = useState<boolean>(false);

  // Authentication verification
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Verify authentication
  const verifyAuth = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.session);
      
      if (!session?.session) {
        return "You must be logged in to upload and process statements.";
      }
      return null;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      return "Authentication error. Please try logging in again.";
    }
  };

  // Progress handling
  const startProgress = useCallback(() => {
    setProgress(0);
    setStep('starting');
  }, []);
  
  const completeProgress = useCallback(() => {
    setProgress(100);
    setStep('complete');
  }, []);
  
  const resetProgress = useCallback(() => {
    setProgress(0);
    setStep('idle');
  }, []);

  // Error handling
  const onError = useCallback((errorMessage: string): boolean => {
    setError(errorMessage);
    setUploading(false);
    resetProgress();
    return true;
  }, [resetProgress]);

  // File validation
  const validateFile = (file: File) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'];
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.pdf'];
    
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension) && !allowedTypes.includes(file.type)) {
      return `Invalid file type. Please upload a CSV, Excel, or PDF file.`;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`;
    }
    
    return null;
  };

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
  }, []);

  const processStatement = useCallback(async (file: File, preferredAIProvider: string, isAuthenticated: boolean, useVisionApi: boolean) => {
    setUploading(true);
    setError(null);
    startProgress();
    setCancelled(false);
    
    try {
      if (!isAuthenticated) {
        const authErrorMessage = await verifyAuth();
        if (authErrorMessage) {
          setError(authErrorMessage);
          setUploading(false);
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
          setUploading(false);
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
          setUploading(false);
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
      setUploading(false);
      resetProgress();
    }
  }, [startProgress, resetProgress, completeProgress, onTransactionsParsed, storePdfInSupabase, extractPdfText, setIsProcessingPdf, useOcrSpace, verifyAuth]);

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
    await processStatement(file, preferredAIProvider, !!isAuthenticated, useVisionApi);
  }, [file, verifyAuth, processStatement, preferredAIProvider, isAuthenticated, useVisionApi]);

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
    setUseVisionApi,
    useOcrSpace
  };
};
