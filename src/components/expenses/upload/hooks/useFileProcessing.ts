
import { useState } from "react";
import { ParsedTransaction } from "../parsers/types";
import { parseViaEdgeFunction } from "../parsers/edgeFunctionParser";
import { supabase } from "@/integrations/supabase/client";

export const useFileProcessing = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);

  // Check authentication status on mount
  useState(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuthStatus();
  });

  const processServerSide = async (
    file: File,
    onSuccess: (transactions: ParsedTransaction[]) => void,
    onError: (errorMessage: string) => boolean,
    resetProgress: () => void,
    completeProgress: () => void,
    isCancelled: boolean,
    setIsWaitingForServer?: (isWaiting: boolean) => void,
    preferredProvider?: string
  ) => {
    try {
      setProcessing(true);
      
      // If we're waiting for server, update the UI
      if (setIsWaitingForServer) {
        setIsWaitingForServer(true);
      }
      
      // Check authentication before starting the server request
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.access_token) {
        onError("You need to be signed in to use server-side processing. Please sign in and try again.");
        resetProgress();
        if (setIsWaitingForServer) {
          setIsWaitingForServer(false);
        }
        setProcessing(false);
        return;
      }
      
      // Process with edge function - direct parsing only
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          completeProgress();
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          setProcessing(false);
          onSuccess(transactions);
        },
        (errorMessage) => {
          if (isCancelled) return true;
          
          setProcessing(false);
          
          if (setIsWaitingForServer) {
            setIsWaitingForServer(false);
          }
          
          onError(errorMessage);
          resetProgress();
          return true;
        },
        resetProgress,
        completeProgress,
        isCancelled,
        setIsWaitingForServer,
        preferredProvider
      );
    } catch (error: any) {
      if (isCancelled) return;
      
      setProcessing(false);
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      
      onError(error.message || "Unexpected error processing file");
      resetProgress();
    }
  };

  return {
    processServerSide,
    isAuthenticated,
    processing
  };
};
