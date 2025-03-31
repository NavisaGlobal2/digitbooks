
import { useState, useEffect } from "react";
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
      
      await processServerSide(
        file,
        (transactions) => {
          setUploading(false);
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          setUploading(false);
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                            errorMessage.toLowerCase().includes('sign in') ||
                            errorMessage.toLowerCase().includes('token');
                            
          const isAnthropicError = errorMessage.toLowerCase().includes('anthropic') ||
                           errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('overloaded');

          const isDeepSeekError = errorMessage.toLowerCase().includes('deepseek');
          
          // Show the error message to the user
          handleError(errorMessage);
          
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
    isAuthenticated,
    // AI provider selection
    preferredAIProvider,
    setPreferredAIProvider
  };
};
