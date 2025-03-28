
import { useState, useEffect, useRef } from "react";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useFileProcessing } from "@/hooks/useFileProcessing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const [processingInProgress, setProcessingInProgress] = useState(false);
  
  // Use a ref to track the current file being processed
  const processingFileRef = useRef<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (!data.session) {
        console.log("User is not authenticated");
      } else {
        console.log("User is authenticated");
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      console.log("Auth state changed, authenticated:", authenticated);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    processServerSide
  } = useFileProcessing();

  // Clear processing attempts when file changes
  useEffect(() => {
    if (file) {
      setProcessingAttempts(0);
    }
  }, [file]);

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
      
      setFile(selectedFile);
      clearError();
      
      // Check file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
        setError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
        return;
      }
      
      // Check file size
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum file size is 10MB.');
        return;
      }
      
      // If not authenticated, warn the user
      if (!isAuthenticated) {
        setError('Processing requires authentication. Please sign in to use this feature.');
        return;
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
    if (processingFileRef.current === `${file.name}-${file.size}-${file.lastModified}`) {
      console.log("This exact file is already being processed, preventing duplicate processing");
      return;
    }

    setUploading(true);
    setProcessingInProgress(true);
    clearError();
    setProcessingAttempts(prev => prev + 1);
    
    // Set the current processing file reference
    processingFileRef.current = `${file.name}-${file.size}-${file.lastModified}`;

    try {
      // Start progress simulation
      startProgress();
      
      // If not authenticated, show error
      if (!isAuthenticated) {
        handleError("Processing requires authentication. Please sign in to use this feature.");
        resetProgress();
        setUploading(false);
        setProcessingInProgress(false);
        processingFileRef.current = null;
        return;
      }
      
      console.log(`Starting file processing with edge function (Attempt #${processingAttempts + 1})`);
      console.log(`File type: ${file.type}, name: ${file.name}`);
      
      await processServerSide(
        file,
        (transactions) => {
          setUploading(false);
          setProcessingInProgress(false);
          processingFileRef.current = null;
          
          if (transactions && transactions.length > 0) {
            console.log(`Received ${transactions.length} parsed transactions`);
            onTransactionsParsed(transactions);
          } else {
            handleError("No transactions were found in the file. Please try a different file or format.");
            resetProgress();
          }
        },
        (errorMessage) => {
          setUploading(false);
          setProcessingInProgress(false);
          processingFileRef.current = null;
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                            errorMessage.toLowerCase().includes('sign in') ||
                            errorMessage.toLowerCase().includes('token');
                            
          const isAnthropicError = errorMessage.toLowerCase().includes('anthropic') ||
                           errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('overloaded');

          const isDeepSeekError = errorMessage.toLowerCase().includes('deepseek');
          
          // Show the error message to the user
          handleError(errorMessage);
          
          // If it's a PDF and a specific error, suggest trying again immediately
          if (file.name.toLowerCase().endsWith('.pdf') && 
              (errorMessage.includes("sandbox environment internal error") || 
               errorMessage.includes("Maximum call stack size exceeded"))) {
            
            // If we haven't tried too many times, suggest trying again
            if (processingAttempts < 1 && !processingInProgress) {
              toast.info("PDF processing requires another attempt. Trying again automatically...");
              
              // Wait a moment then try again
              setTimeout(() => {
                parseFile();
              }, 1000);
              
              return false; // Don't reset progress yet
            } else {
              toast.warning("PDF processing is having technical difficulties. Please try a CSV version of this statement if available.");
            }
          }
          
          // For auth or critical API errors, don't try to fallback
          if (isAuthError || (isAnthropicError && isDeepSeekError)) {
            resetProgress();
            
            if ((isAnthropicError || isDeepSeekError) && !file.name.toLowerCase().endsWith('.csv')) {
              toast.error("Both AI processing services are currently unavailable. Try using a CSV file format instead.");
            }
            
            return true;
          }
          
          resetProgress();
          return true;
        },
        resetProgress,
        completeProgress,
        isCancelled,
        setIsWaitingForServer,
        preferredAIProvider
      );
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
      setUploading(false);
      setProcessingInProgress(false);
      processingFileRef.current = null;
    }
  };

  const clearFile = () => {
    setFile(null);
    clearError();
    setUploading(false);
    resetProgress();
    setProcessingAttempts(0);
    setProcessingInProgress(false);
    processingFileRef.current = null;
    
    // Clear PDF attempt counter from localStorage
    localStorage.removeItem('pdf_attempt_count');
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
