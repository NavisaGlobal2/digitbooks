
import { useState } from "react";
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
}

export const useFileProcessing = ({
  onTransactionsParsed,
  handleError,
  resetProgress,
  completeProgress,
  showFallbackMessage,
  isCancelled
}: FileProcessingProps) => {
  const [csvParseResult, setCsvParseResult] = useState<CSVParseResult | null>(null);
  const [showColumnMapping, setShowColumnMapping] = useState(false);

  const processServerSide = async (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    try {
      // Check authentication before starting the server request
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.access_token) {
        handleError("You need to be signed in to use server-side processing. Please sign in and try again.");
        resetProgress();
        return;
      }
      
      // Now process with edge function
      const result = await parseViaEdgeFunction(
        file,
        (transactions) => {
          if (isCancelled) return;
          completeProgress();
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          if (isCancelled) return;
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                              errorMessage.toLowerCase().includes('sign in') ||
                              errorMessage.toLowerCase().includes('token');
          
          handleError(errorMessage);
          
          // For auth errors, don't try to fallback to client-side
          if (isAuthError) {
            resetProgress();
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
    processClientSideCSV
  };
};
