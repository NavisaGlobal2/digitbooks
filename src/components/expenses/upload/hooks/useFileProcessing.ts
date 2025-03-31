
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from "../parsers/types";
import { getAuthToken, getApiEndpoint, API_BASE } from "../parsers/api/apiHelpers";
import { mapDatabaseTransactions, mapApiResponseTransactions } from "../parsers/api/transactionMapper";
import { ApiResponse } from "../parsers/api/types";

interface UseFileProcessingProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  handleError: (message: string) => void;
  resetProgress: () => void;
  completeProgress: () => void;
  showFallbackMessage: () => void;
  isCancelled: boolean;
  setIsWaitingForServer: (waiting: boolean) => void;
}

export const useFileProcessing = ({
  onTransactionsParsed,
  handleError,
  resetProgress,
  completeProgress,
  showFallbackMessage,
  isCancelled,
  setIsWaitingForServer
}: UseFileProcessingProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Process using API
  const processServerSide = async (file: File): Promise<void> => {
    try {
      setIsWaitingForServer(true);
      
      // Check authentication
      const token = await getAuthToken();
      
      if (!token) {
        setIsAuthenticated(false);
        handleError("Authentication required to process bank statements. Please sign in and try again.");
        resetProgress();
        return;
      }
      
      console.log(`Processing ${file.name} (${file.type}) to API endpoint...`);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Get appropriate endpoint
      const endpoint = getApiEndpoint(file);
      
      try {
        // Call the API
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned status ${response.status}: ${errorText}`);
        }
        
        const responseData = await response.json() as ApiResponse;
        
        // Handle API errors
        if (responseData.success === false) {
          handleError(`API Error: ${responseData.message || "Unknown error processing statement"}`);
          resetProgress();
          return;
        }
        
        // Check if we're getting the new API format with statement_id
        if (responseData.success && responseData.statement_id && !responseData.transactions) {
          // Fetch transactions from database
          const transactions = await mapDatabaseTransactions(responseData.statement_id);
          
          if (transactions.length === 0) {
            handleError("Transactions were processed but couldn't be retrieved from the database.");
            resetProgress();
            return;
          }
          
          console.log(`Successfully parsed ${transactions.length} transactions`);
          completeProgress();
          onTransactionsParsed(transactions);
          return;
        }
        
        // Handle the legacy response format
        if (!responseData.transactions || !Array.isArray(responseData.transactions)) {
          console.error('Invalid response data:', responseData);
          handleError("The server returned an invalid response. Please try again.");
          resetProgress();
          return;
        }
        
        // Map the transactions
        const transactions = mapApiResponseTransactions(responseData.transactions, responseData.batchId);
        
        if (transactions.length === 0) {
          handleError("No transactions found in the file. Please check the format and try again.");
          resetProgress();
          return;
        }
        
        console.log(`Successfully parsed ${transactions.length} transactions`);
        completeProgress();
        onTransactionsParsed(transactions);
        
      } catch (invokeError) {
        console.error("Error calling API:", invokeError);
        handleError(`Server error: ${invokeError instanceof Error ? invokeError.message : 'Unknown error'}`);
        resetProgress();
        return;
      }
    } catch (error) {
      console.error('Error in processServerSide:', error);
      
      if ((error as Error).message.includes('network') || (error as Error).message.includes('fetch')) {
        handleError("Network error. Please check your connection and try again.");
      } else {
        handleError(`Error processing file: ${(error as Error).message}`);
      }
      
      resetProgress();
      showFallbackMessage();
    } finally {
      setIsWaitingForServer(false);
    }
  };

  // Helper function to process receipt files
  const processReceiptFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const receiptUrl = reader.result as string;
        resolve(receiptUrl);
      };
      
      reader.onerror = () => {
        toast.error("Failed to process receipt file");
        reject("Failed to process receipt file");
      };
    });
  };

  return {
    processServerSide,
    processReceiptFile,
    isAuthenticated
  };
};
