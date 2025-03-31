
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "../../parsers/types";
import { mapApiResponseToTransactions } from "./transactionMapper";

export const parseWithEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = 'anthropic'
): Promise<void> => {
  try {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Create form data with the file and preferences
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preferredProvider', preferredProvider);
    formData.append('fileName', file.name);

    console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes) via edge function`);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      onError("No transactions found in file");
      return;
    }

    // Map API response to transactions
    const transactions = mapApiResponseToTransactions(data);
    
    if (transactions.length === 0) {
      onError("Failed to parse transactions from response");
      return;
    }

    console.log(`Successfully parsed ${transactions.length} transactions`);
    
    // Send the transactions to the caller
    onSuccess(transactions);
  } catch (error: any) {
    console.error("Error in parseWithEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
