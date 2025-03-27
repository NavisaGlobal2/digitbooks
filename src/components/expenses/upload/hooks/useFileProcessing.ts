
import { useState } from "react";
import { toast } from "sonner";
import { parseCSVFile, CSVParseResult } from "../parsers/csvParser";
import { parseViaEdgeFunction, ParsedTransaction } from "../parsers";

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
    // Set a timeout for edge function calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Server processing timed out after 45 seconds")), 45000);
    });
    
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    try {
      // Race the edge function call against the timeout
      await Promise.race([
        parseViaEdgeFunction(
          file,
          (transactions) => {
            if (isCancelled) return;
            completeProgress();
            onTransactionsParsed(transactions);
          },
          (errorMessage) => {
            if (isCancelled) return;
            handleError(errorMessage);
            
            // Fallback to client-side parsing if not a PDF
            if (!isPdf) {
              const isCsv = file.name.toLowerCase().endsWith('.csv');
              showFallbackMessage();
              
              if (isCsv) {
                processClientSideCSV(file);
              } else {
                handleError("Client-side Excel parsing is not fully implemented yet. Please try CSV format.");
              }
            }
          }
        ),
        timeoutPromise
      ]);
    } catch (error: any) {
      if (isCancelled) return;
      
      console.error("Edge function timeout or error:", error);
      handleError("Server processing timed out. Please try client-side processing or a smaller file.");
      
      // Fallback to client-side parsing if not a PDF
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      if (!isPdf && isCsv) {
        showFallbackMessage("Falling back to client-side parsing due to timeout");
        processClientSideCSV(file);
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
