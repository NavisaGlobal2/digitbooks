
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from "../parsers/types";

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

  // Process using edge function
  const processServerSide = async (file: File): Promise<void> => {
    try {
      setIsWaitingForServer(true);
      
      // Prepare form data for the edge function
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Processing ${file.name} (${file.type}) to edge function for processing...`);
      
      // Get the auth session token
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        setIsAuthenticated(false);
        handleError(`Authentication error: ${authError.message}`);
        resetProgress();
        return;
      }
      
      const session = data.session;
      
      if (!session) {
        setIsAuthenticated(false);
        handleError("Authentication required to process bank statements. Please sign in and try again.");
        resetProgress();
        return;
      }

      // Call the appropriate edge function based on file type
      let response;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      try {
        if (fileExt === 'pdf') {
          response = await supabase.functions.invoke('parse-bank-statement-ai', {
            body: formData,
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
        } else {
          // For CSV and Excel files
          response = await supabase.functions.invoke('parse-bank-statement', {
            body: formData,
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
        }
      } catch (invokeError) {
        console.error("Error invoking edge function:", invokeError);
        handleError(`Server error: ${invokeError instanceof Error ? invokeError.message : 'Unknown error'}`);
        resetProgress();
        return;
      }
      
      // Handle the response
      if (response.error) {
        console.error('Edge function error:', response.error);
        
        if (response.error.message && response.error.message.includes("authentication")) {
          setIsAuthenticated(false);
          handleError("Authentication error: Please sign in again to refresh your session.");
          resetProgress();
          return;
        }
        
        handleError(`Processing error: ${response.error.message || 'Unknown error'}`);
        resetProgress();
        return;
      }
      
      if (!response.data || !Array.isArray(response.data.transactions)) {
        console.error('Invalid response data:', response);
        handleError("The server returned an invalid response. Please try again.");
        resetProgress();
        return;
      }
      
      // Map the response to ParsedTransaction objects
      const transactions: ParsedTransaction[] = response.data.transactions.map((item: any, index: number) => ({
        id: `trans-${index}`,
        date: new Date(item.date),
        description: item.description,
        amount: Math.abs(parseFloat(item.amount)),
        type: item.type || (parseFloat(item.amount) < 0 ? 'debit' : 'credit'),
        category: '',
        selected: item.type === 'debit' || parseFloat(item.amount) < 0, // Pre-select debits
        batchId: response.data.batchId
      }));
      
      if (transactions.length === 0) {
        handleError("No transactions found in the file. Please check the format and try again.");
        resetProgress();
        return;
      }
      
      console.log(`Successfully parsed ${transactions.length} transactions`);
      
      // Complete progress and return transactions
      completeProgress();
      onTransactionsParsed(transactions);
      
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
