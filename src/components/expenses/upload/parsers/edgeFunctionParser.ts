
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
): Promise<ParsedTransaction[]> => {
  try {
    // Create a form to send the file
    const formData = new FormData();
    formData.append("file", file);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    // Choose the appropriate endpoint based on file type
    const endpoint = fileExt === 'pdf' ? 'parse-bank-statement-ai' : 'parse-bank-statement';

    console.log(`Sending file to edge function: ${endpoint}`);
    
    // Check authentication status before making the request
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('No authentication session found');
      const errorMsg = "You need to be signed in to use this feature. Please sign in and try again.";
      onError(errorMsg);
      return [];
    }
    
    // Call the serverless function with proper authentication
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: formData,
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
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
        const errorMsg = "Anthropic API key error: Either the key is not configured, invalid, or you've exceeded your rate limit. Please contact your administrator.";
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

    // Map the server response to our ParsedTransaction type
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
      id: crypto.randomUUID(),
      date: new Date(tx.date),
      description: tx.description,
      amount: Math.abs(parseFloat(tx.amount)), // Store as positive number
      type: tx.type || (parseFloat(tx.amount) < 0 ? 'debit' : 'credit'),
      category: tx.category || undefined,
      selected: tx.type === 'debit' || parseFloat(tx.amount) < 0, // Pre-select debits
      batchId: data.batchId
    }));

    // Filter transactions if needed (e.g., only include expenses)
    const filteredTransactions = parsedTransactions.filter(tx => 
      tx.type === 'debit' || parseFloat(tx.amount.toString()) < 0
    );
    
    if (filteredTransactions.length === 0) {
      onError("No expense transactions found in the statement. Only expense transactions can be imported.");
      return [];
    }

    // Call success callback with transactions
    onSuccess(filteredTransactions);
    
    // Only show toast for significant number of transactions
    if (filteredTransactions.length > 5) {
      toast.success(`Parsed ${filteredTransactions.length} expenses from your statement`);
    }
    
    return filteredTransactions;
  } catch (error) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};
