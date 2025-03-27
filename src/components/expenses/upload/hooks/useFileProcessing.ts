
import { useState, useEffect, useCallback } from "react";
import { parseViaEdgeFunction, ParsedTransaction } from "../parsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileProcessingProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  handleError: (errorMessage: string) => boolean;
  resetProgress: () => void;
  completeProgress: () => void;
  showFallbackMessage: (message?: string) => void;
  isCancelled: boolean;
  setIsWaitingForServer?: (isWaiting: boolean) => void;
}

export const useFileProcessing = ({
  onTransactionsParsed,
  handleError,
  resetProgress,
  completeProgress,
  showFallbackMessage,
  isCancelled,
  setIsWaitingForServer
}: FileProcessingProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuthStatus();
  }, []);

  // Verify user authentication and access token
  const verifyAuthentication = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session || !sessionData.session.access_token) {
      handleError("You need to be signed in to use server-side processing. Please sign in and try again.");
      resetProgress();
      setIsWaitingForServerState(false);
      return false;
    }
    
    return true;
  }, [handleError, resetProgress]);
  
  // Handle server process completion
  const handleProcessSuccess = useCallback((transactions: ParsedTransaction[]) => {
    if (isCancelled) return;
    
    completeProgress();
    setIsWaitingForServerState(false);
    onTransactionsParsed(transactions);
  }, [isCancelled, completeProgress, onTransactionsParsed]);
  
  // Handle server process errors
  const handleProcessError = useCallback((errorMessage: string) => {
    if (isCancelled) return true;
    
    setIsWaitingForServerState(false);
    
    const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                        errorMessage.toLowerCase().includes('sign in') ||
                        errorMessage.toLowerCase().includes('token');
    const isAPIError = errorMessage.toLowerCase().includes('anthropic') ||
                       errorMessage.toLowerCase().includes('api key');
    
    handleError(errorMessage);
    
    // For auth or API errors, don't try to fallback
    if (isAuthError || isAPIError) {
      resetProgress();
      
      if (isAPIError) {
        handleError("The AI processing feature requires a valid Anthropic API key. Please contact your administrator.");
      }
      
      return true;
    }
    
    resetProgress();
    return true;
  }, [isCancelled, handleError, resetProgress]);
  
  // Set waiting for server state helper
  const setIsWaitingForServerState = useCallback((isWaiting: boolean) => {
    if (setIsWaitingForServer) {
      setIsWaitingForServer(isWaiting);
    }
  }, [setIsWaitingForServer]);
  
  // Process file on server side
  const processServerSide = useCallback(async (file: File) => {
    try {
      // Update UI for server waiting state
      setIsWaitingForServerState(true);
      
      // Verify user is authenticated
      const isAuthValid = await verifyAuthentication();
      if (!isAuthValid) return;
      
      // Process with edge function
      await parseViaEdgeFunction(
        file,
        handleProcessSuccess,
        handleProcessError
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      setIsWaitingForServerState(false);
      
      console.error("Edge function error:", error);
      handleError(error.message || "Error processing file on server.");
      resetProgress();
    }
  }, [
    verifyAuthentication, 
    handleProcessSuccess, 
    handleProcessError, 
    setIsWaitingForServerState,
    isCancelled,
    handleError,
    resetProgress
  ]);

  return {
    processServerSide,
    isAuthenticated
  };
};
