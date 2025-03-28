
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { parseCSVFile, CSVParseResult } from "../parsers/csvParser";
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
  const [csvParseResult, setCsvParseResult] = useState<CSVParseResult | null>(null);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuthStatus();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const processServerSide = async (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
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
      const result = await parseViaEdgeFunction(
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
          const isOpenAIError = errorMessage.toLowerCase().includes('openai') ||
                               errorMessage.toLowerCase().includes('api key');
          
          handleError(errorMessage);
          
          // For auth or OpenAI errors, don't try to fallback to client-side
          if (isAuthError || isOpenAIError) {
            resetProgress();
            
            if (isOpenAIError) {
              toast.error("The AI processing feature requires an OpenAI API key. Please contact your administrator.");
            }
            
            return true;
          }
          
          // Fallback to client-side parsing if not a PDF
          if (!isPdf) {
            const isCsv = file.name.toLowerCase().endsWith('.csv');
            showFallbackMessage("Falling back to client-side processing");
            
            if (isCsv) {
              processClientSideCSV(file);
            } else {
              handleError("Client-side Excel parsing is not fully implemented yet. Please try CSV format.");
              resetProgress();
            }
          } else {
            resetProgress();
          }
          
          return true;
        }
      );
      
      return result;
    } catch (error: any) {
      if (isCancelled) return;
      
      if (setIsWaitingForServer) {
        setIsWaitingForServer(false);
      }
      
      console.error("Edge function error:", error);
      handleError(error.message || "Error processing file on server. Trying client-side processing.");
      
      // Fallback to client-side parsing if not a PDF
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      if (!isPdf && isCsv) {
        showFallbackMessage("Falling back to client-side parsing");
        processClientSideCSV(file);
      } else {
        resetProgress();
      }
    }
  };

  const processClientSideCSV = (file: File) => {
    try {
      parseCSVFile(
        file,
        (result) => {
          if (isCancelled) return;
          setCsvParseResult(result);
          setShowColumnMapping(true);
          resetProgress();
        },
        (errorMessage) => {
          if (isCancelled) return;
          handleError(errorMessage);
          resetProgress();
        }
      );
    } catch (error) {
      console.error("CSV parsing error:", error);
      handleError("Failed to parse CSV file. Please check the file format.");
      resetProgress();
    }
  };

  return {
    csvParseResult,
    setCsvParseResult,
    showColumnMapping,
    setShowColumnMapping,
    processServerSide,
    processClientSideCSV,
    isAuthenticated
  };
};
