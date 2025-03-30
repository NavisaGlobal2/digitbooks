
import { useState } from "react";
import { toast } from "sonner";
import { ParsedTransaction } from "../parsers";
import { parseViaEdgeFunction } from "../parsers/edgeFunctionParser";
import { supabase } from "@/integrations/supabase/client";

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
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("fallback");
  const [processing, setProcessing] = useState(false);

  // Check authentication status on mount
  useState(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuthStatus();
  });

  const processServerSide = async (file: File) => {
    try {
      setProcessing(true);
      
      // If we're waiting for server, update the UI
      if (setIsWaitingForServer) {
        setIsWaitingForServer(true);
      }
      
      // Check authentication before starting the server request
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.access_token) {
        handleError("You need to be signed in to use server-side processing. Please sign in and try again.");
        resetProgress();
        if (setIsWaitingForServer) {
          setIsWaitingForServer(false);
        }
        setProcessing(false);
        return;
      }
      
      // Now process with edge function
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          completeProgress();
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          setProcessing(false);
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          if (isCancelled) return true;
          
          setProcessing(false);
          
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                            errorMessage.toLowerCase().includes('sign in') ||
                            errorMessage.toLowerCase().includes('token');
                            
          // Show the error message to the user
          handleError(errorMessage);
          
          // For auth errors, don't try to fallback
          if (isAuthError) {
            resetProgress();
            return true;
          }
          
          resetProgress();
          return true;
        },
        preferredAIProvider
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      setProcessing(false);
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      
      console.error("Edge function error:", error);
      handleError(error.message || "Error processing file on server.");
      resetProgress();
      
      // For CSV files, suggest using client-side parsing as fallback
      if (file.name.toLowerCase().endsWith('.csv')) {
        toast.info("Server processing failed. You can try uploading the file again.");
      }
    }
  };

  return {
    processing,
    processServerSide,
    isAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider
  };
};
