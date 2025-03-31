
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "../types";

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
    formData.append('context', 'general');

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

    // Map API response to transactions with consistent format
    const transactions = data.transactions.map((tx: any) => ({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      date: tx.date,
      description: tx.description,
      amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
      type: tx.type || (parseFloat(tx.amount) < 0 ? "debit" : "credit"),
      selected: tx.type === "debit" || parseFloat(tx.amount) < 0,
      category: tx.category || "",
      source: tx.source || ""
    }));

    console.log(`Successfully parsed ${transactions.length} transactions`);
    
    // Send the transactions to the caller
    onSuccess(transactions);
  } catch (error: any) {
    console.error("Error in parseWithEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
