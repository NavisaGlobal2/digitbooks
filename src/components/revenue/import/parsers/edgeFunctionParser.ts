
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  useAIFormatting: boolean = true
): Promise<void> => {
  try {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Create form data with the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('context', 'revenue'); // Specific context for revenue parsing
    formData.append('useAIFormatting', useAIFormatting.toString());

    console.log(`Processing ${file.name} for revenue parsing via edge function`);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions)) {
      onError("No transactions found in file");
      return;
    }

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Filter to only include credit (positive amount) transactions for revenue
    const revenueTransactions = data.transactions
      .filter((tx: any) => tx.type === 'credit' || (typeof tx.amount === 'number' && tx.amount > 0))
      .map((tx: any) => ({
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: tx.date || new Date().toISOString(),
        description: tx.description || "Unknown revenue",
        amount: typeof tx.amount === 'number' ? Math.abs(tx.amount) : Math.abs(parseFloat(tx.amount || '0')),
        type: "credit",
        selected: true,
        source: tx.sourceSuggestion?.source || "",
        sourceSuggestion: tx.sourceSuggestion,
        originalDate: tx.originalDate || tx.date,
        originalAmount: tx.originalAmount || tx.amount,
        preservedColumns: tx.preservedColumns || {}
      }));

    console.log(`Found ${revenueTransactions.length} revenue transactions out of ${data.transactions.length} total`);
    
    // Send the filtered revenue transactions to the caller
    onSuccess(revenueTransactions);
  } catch (error: any) {
    // Reset progress if provided
    if (resetProgress) {
      resetProgress();
    }
    
    console.error("Error in parseViaEdgeFunction for revenue:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
