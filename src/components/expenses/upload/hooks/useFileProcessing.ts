
import { useState } from "react";
import { parseViaEdgeFunction, ParsedTransaction } from "../parsers";
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
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          if (isCancelled) return true;
          
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          
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
        }
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      
      console.error("Edge function error:", error);
      handleError(error.message || "Error processing file on server.");
      resetProgress();
    }
  };

  return {
    processServerSide,
    isAuthenticated
  };
};
