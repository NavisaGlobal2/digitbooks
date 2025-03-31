
import { useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useFileProcessing } from "./useFileProcessing";
import { supabase } from "@/integrations/supabase/client";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!data.session);
        
        if (!data.session) {
          console.log("No active session found");
        } else {
          console.log("User is authenticated");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed, user is authenticated:", !!session);
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
    updateProgress
  } = useUploadProgress();

  const {
    error,
    setError,
    handleError,
    clearError
  } = useUploadError();

  const {
    processServerSide,
    isAuthenticated: fileProcessingIsAuthenticated
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
      
      // Double-check authentication before proceeding
      const { data } = await supabase.auth.getSession();
      
      // If not authenticated, show error
      if (!data.session) {
        handleError("Processing requires authentication. Please sign in to use this feature.");
        resetProgress();
        setUploading(false);
        return;
      }
      
      console.log(`Attempting to process file: ${file.name}, type: ${file.type}`);
      await processServerSide(file);
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
    } finally {
      if (isCancelled) {
        setUploading(false);
      }
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
