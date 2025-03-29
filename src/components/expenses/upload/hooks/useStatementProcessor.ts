
import { useFileProcessing } from "@/hooks/useFileProcessing";
import { ParsedTransaction } from "../parsers";

interface StatementProcessorProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  onError: (errorMessage: string) => boolean;
  startProgress: () => void;
  resetProgress: () => void;
  completeProgress: () => void;
  isCancelled: boolean;
  setIsWaitingForServer: (isWaiting: boolean) => void;
  startProcessing: (file: File) => void;
  stopProcessing: () => void;
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
  stopProcessing
}: StatementProcessorProps) => {
  const { processServerSide } = useFileProcessing();

  const processStatement = async (file: File, preferredAIProvider: string, isAuthenticated: boolean, useVisionApi: boolean = true) => {
    // Prevent double processing
    if (!file) {
      onError("Please select a bank statement file");
      return;
    }
    
    if (!isAuthenticated) {
      onError("Processing requires authentication. Please sign in to use this feature.");
      return;
    }

    startProcessing(file);
    startProgress();
    
    try {
      console.log(`Starting file processing with edge function`);
      console.log(`File type: ${file.type}, name: ${file.name}, using provider: ${preferredAIProvider}, Vision API: ${useVisionApi}`);
      
      // Create proper options object with all necessary flags
      const processingOptions = {
        preferredProvider: preferredAIProvider,
        // Use Vision API based on user preference, default to true for PDFs
        useVision: file.name.toLowerCase().endsWith('.pdf') ? useVisionApi : false,
        // Force real data extraction
        forceRealData: true,
        extractRealData: true,
        noDummyData: true
      };
      
      await processServerSide(
        file,
        (transactions) => {
          stopProcessing();
          
          if (transactions && transactions.length > 0) {
            console.log(`Received ${transactions.length} parsed transactions`);
            onTransactionsParsed(transactions);
          } else {
            onError("No transactions were found in the file. Please try a different file or format.");
            resetProgress();
          }
        },
        (errorMessage) => {
          stopProcessing();
          
          const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                            errorMessage.toLowerCase().includes('sign in') ||
                            errorMessage.toLowerCase().includes('token');
                            
          const isAnthropicError = errorMessage.toLowerCase().includes('anthropic') ||
                           errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('overloaded');

          const isDeepSeekError = errorMessage.toLowerCase().includes('deepseek');
          
          // Show the error message to the user
          onError(errorMessage);
          
          // If it's a PDF and a specific error, suggest trying again immediately
          if (file.name.toLowerCase().endsWith('.pdf') && 
              (errorMessage.includes("sandbox environment internal error") || 
               errorMessage.includes("Maximum call stack size exceeded"))) {
            return false; // Don't reset progress yet
          }
          
          // For auth or critical API errors, don't try to fallback
          if (isAuthError || (isAnthropicError && isDeepSeekError)) {
            resetProgress();
            return true;
          }
          
          resetProgress();
          return true;
        },
        resetProgress,
        completeProgress,
        isCancelled,
        setIsWaitingForServer,
        processingOptions
      );
    } catch (error) {
      console.error("Unexpected error in processStatement:", error);
      onError("An unexpected error occurred. Please try again.");
      stopProcessing();
    }
  };

  return {
    processStatement
  };
};
