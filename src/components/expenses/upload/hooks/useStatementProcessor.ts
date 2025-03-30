
import { useState, useCallback } from "react";
import { parsePDFFile } from "../parsers/pdfParser";
import { parseStatementFile, ParsedTransaction } from "../parsers";
import { useProcessingState } from "./useProcessingState";

interface StatementProcessorProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  onError: (errorMessage: string) => boolean;
  startProgress: (steps?: number) => void;
  resetProgress: () => void;
  completeProgress: () => void;
  isCancelled: boolean;
  setIsWaitingForServer?: (isWaiting: boolean) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  storePdfInSupabase?: boolean;
}

export const useStatementProcessor = ({
  onTransactionsParsed,
  onError,
  startProgress,
  resetProgress,
  completeProgress,
  isCancelled,
  setIsWaitingForServer,
  startProcessing,
  stopProcessing,
  storePdfInSupabase = false
}: StatementProcessorProps) => {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  
  const processStatement = useCallback(async (
    file: File, 
    preferredAIProvider: string, 
    isAuthenticated: boolean,
    useVisionApi: boolean = true
  ) => {
    startProcessing();
    startProgress();
    
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      setProcessingStatus(`Processing ${fileExt === 'pdf' ? 'PDF' : fileExt} file...`);
      
      // For PDFs, we want to use the PDF-specific parser with more detailed error handling
      if (fileExt === 'pdf') {
        console.log(`Processing PDF file with Vision API: ${useVisionApi}`);
        parsePDFFile(
          file, 
          onTransactionsParsed, 
          onError,
          "expense", 
          storePdfInSupabase
        );
      } else {
        console.log(`Processing ${fileExt} file with standard parser`);
        
        if (!isAuthenticated) {
          // For non-PDFs, try client-side parsing first if not authenticated
          parseStatementFile(
            file,
            (result) => {
              if (isCancelled) return;
              
              completeProgress();
              
              // Check if we got transactions array or CSV parse result
              const transactions = Array.isArray(result) ? result : result.data;
              console.log(`Successfully parsed ${transactions.length} transactions`);
              
              onTransactionsParsed(transactions);
              stopProcessing();
            },
            (errorMessage) => {
              if (isCancelled) return;
              
              onError(errorMessage);
              stopProcessing();
            }
          );
        } else {
          // If authenticated, we want to use the edge function for all file types
          setProcessingStatus(`Processing ${fileExt} file with AI...`);
          
          const { processServerSide } = await import("../../../../hooks/useFileProcessing");
          processServerSide(
            file,
            onTransactionsParsed,
            onError,
            resetProgress,
            completeProgress,
            isCancelled,
            setIsWaitingForServer,
            {
              preferredProvider: preferredAIProvider,
              useVision: useVisionApi,
              storePdfInSupabase
            }
          );
        }
      }
    } catch (error: any) {
      if (isCancelled) return;
      
      onError(error.message || "Unexpected error processing file");
      stopProcessing();
    }
  }, [
    onTransactionsParsed,
    onError,
    startProgress,
    resetProgress,
    completeProgress,
    isCancelled,
    setIsWaitingForServer,
    startProcessing,
    stopProcessing,
    storePdfInSupabase
  ]);

  return {
    processStatement,
    processingStatus
  };
};
