
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

    // Decide which endpoint to use based on the file type
    const endpoint = file.name.toLowerCase().endsWith('.pdf') ? 
      'parse-bank-statement-ai' : 'parse-bank-statement';

    // Call the serverless function
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      onError(`Server error: ${error.message}`);
      return [];
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions)) {
      onError("Invalid response from server. No transactions found in the response.");
      return [];
    }

    // Map the server response to our ParsedTransaction type
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
      date: new Date(tx.date),
      description: tx.description,
      amount: Math.abs(parseFloat(tx.amount)), // Store as positive number
      type: tx.type || (parseFloat(tx.amount) < 0 ? 'debit' : 'credit'),
      category: tx.category || null,
      selected: tx.type === 'debit', // Preselect debits
      batchId: data.batchId
    }));

    // Only include debit transactions (expenses)
    const filteredTransactions = parsedTransactions.filter(tx => tx.type === 'debit');
    
    if (filteredTransactions.length === 0) {
      onError("No expense transactions found in the statement. Only expense transactions can be imported.");
      return [];
    }

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
