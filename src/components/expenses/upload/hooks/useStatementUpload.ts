
import { useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useFileProcessing } from "@/hooks/useFileProcessing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[], responseMetadata?: any) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");
  const [useAIFormatting, setUseAIFormatting] = useState<boolean>(true);
  const [responseMetadata, setResponseMetadata] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event received");
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
      
      // Check file type - allow CSV and Excel
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
        setError('Only CSV and Excel files are currently supported.');
        return;
      }
      
      setFile(selectedFile);
      clearError();
      
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
      
      // Reset the retry count when a new file is selected
      setRetryCount(0);
    } else {
      console.log("No file selected in the event");
    }
  };

  const parseFile = async () => {
    if (!file) {
      handleError("Please select a bank statement file");
      return;
    }

    setUploading(true);
    clearError();
    setResponseMetadata(null);

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
      
      console.log("Starting file processing with edge function");
      console.log(`AI formatting is: ${useAIFormatting ? "enabled" : "disabled"}`);
      console.log(`Retry count: ${retryCount}`);
      
      const { parseViaEdgeFunction } = await import("../parsers/edgeFunctionParser");
      
      await parseViaEdgeFunction(
        file,
        (transactions, responseData) => {
          setUploading(false);
          
          // Save any extra metadata from the response
          if (responseData) {
            console.log("Server response metadata:", responseData);
            setResponseMetadata(responseData);
          }
          
          if (!transactions || transactions.length === 0) {
            // If we got no transactions and haven't exceeded retry attempts,
            // try again with AI formatting enabled
            if (retryCount < MAX_RETRIES) {
              const newRetryCount = retryCount + 1;
              setRetryCount(newRetryCount);
              console.log(`No valid transactions found. Retrying (${newRetryCount}/${MAX_RETRIES}) with AI formatting enabled`);
              resetProgress();
              
              // Force AI formatting on retry
              setUseAIFormatting(true);
              
              // Immediate retry
              setTimeout(() => {
                parseFile();
              }, 500);
              return;
            }
            
            handleError("No transactions found in the statement file. Please check the file format or try another file.");
            resetProgress();
            return;
          }
          
          onTransactionsParsed(transactions, responseData);
        },
        (errorMessage) => {
          // Only set uploading to false if we're not going to retry
          if (retryCount >= MAX_RETRIES) {
            setUploading(false);
          }
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                            errorMessage.toLowerCase().includes('sign in') ||
                            errorMessage.toLowerCase().includes('token');
          
          // Only show the error if we're not going to retry
          if (retryCount >= MAX_RETRIES) {
            // Show the error message to the user
            handleError(errorMessage);
            resetProgress();
          } else {
            console.log(`Error occurred, will retry: ${errorMessage}`);
          }
          return true;
        },
        resetProgress,
        completeProgress,
        isCancelled,
        setIsWaitingForServer,
        preferredAIProvider,
        // Force AI formatting on if we're retrying
        retryCount > 0 ? true : useAIFormatting
      );
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
      setUploading(false);
      resetProgress();
    }
  };

  const clearFile = () => {
    setFile(null);
    clearError();
    setUploading(false);
    resetProgress();
    setResponseMetadata(null);
    setRetryCount(0);
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
    setPreferredAIProvider,
    // AI formatting option
    useAIFormatting,
    setUseAIFormatting,
    // Response metadata
    responseMetadata,
    // Retry information
    retryCount
  };
};
