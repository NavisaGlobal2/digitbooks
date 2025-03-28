
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
): Promise<ParsedTransaction[]> => {
  try {
    // Create a form to send the file
    const formData = new FormData();
    formData.append("file", file);

    // We now use only the AI-powered parser for all file types
    const endpoint = 'parse-bank-statement-ai';

    console.log(`Sending file to edge function: ${endpoint}`);
    
    // Check authentication status before making the request
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      const errorMsg = "You need to be signed in to use this feature. Please sign in and try again.";
      onError(errorMsg);
      return [];
    }
    
    // Call the serverless function
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      
      // Check for Anthropic API key error
      if (error.message && (
        error.message.includes("ANTHROPIC_API_KEY") ||
        error.message.includes("Anthropic API") ||
        error.message.includes("exceeded") ||
        error.message.includes("rate limit")
      )) {
        const errorMsg = "Anthropic API issue: Either the service is overloaded, the key is not configured, invalid, or you've exceeded your rate limit. We'll attempt to use a simpler parser for CSV files.";
        onError(errorMsg);
        return [];
      }
      
      // Check for authentication errors
      if (error.message && (
        error.message.includes("Auth session") ||
        error.message.includes("authentication") ||
        error.message.includes("unauthorized")
      )) {
        const errorMsg = "Authentication error: Please try signing out and signing back in to refresh your session.";
        onError(errorMsg);
        return [];
      }
      
      onError(`Server error: ${error.message}`);
      return [];
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions)) {
      onError("Invalid response from server. No transactions found in the response.");
      return [];
    }

    console.log(`Raw transaction data from server:`, data.transactions);
    console.log(`Transaction count from server: ${data.transactions.length}`);

    // Generate a batch ID as a proper UUID to avoid database errors
    const batchId = data.batchId || uuidv4();

    // Map the server response to our ParsedTransaction type
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
      id: `transaction-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(tx.date),
      description: tx.description,
      amount: Math.abs(parseFloat(tx.amount)), // Store as positive number
      type: tx.type || (parseFloat(tx.amount) < 0 ? 'debit' : 'credit'),
      category: tx.category || null,
      selected: tx.type === 'debit', // Preselect debits
      batchId
    }));

    console.log(`Parsed ${parsedTransactions.length} transactions with batch ID: ${batchId}`);

    // Only include debit transactions (expenses)
    const filteredTransactions = parsedTransactions.filter(tx => tx.type === 'debit');
    
    if (filteredTransactions.length === 0) {
      onError("No expense transactions found in the statement. Only expense transactions can be imported.");
      return [];
    }

    console.log(`Found ${filteredTransactions.length} expense transactions to display`);

    // Call success callback with transactions
    onSuccess(filteredTransactions);
    
    // Show success message with the transaction count
    toast.success(`Successfully parsed ${filteredTransactions.length} expenses from your statement`);
    
    return filteredTransactions;
  } catch (error) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};
