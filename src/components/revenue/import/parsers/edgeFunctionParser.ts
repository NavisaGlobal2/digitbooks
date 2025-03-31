
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { RevenueSource } from "@/types/revenue";
import { extractDate, extractDescription, extractAmount, extractCreditAmount } from "./utils/transactionFormatters";
import { suggestRevenueSource } from "./utils/sourcePredictor";

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
    formData.append('useAIFormatting', useAIFormatting.toString()); // Explicitly enable AI formatting
    formData.append('preferredProvider', 'anthropic'); // Specifically request Anthropic for formatting

    console.log(`Processing ${file.name} for revenue parsing via edge function with AI formatting ${useAIFormatting ? 'enabled' : 'disabled'}`);

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

    // Log the raw transactions data to debug
    console.log("Raw transactions from edge function:", data.transactions.slice(0, 2));
    console.log("AI formatting applied:", data.formattingApplied || false);

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Transform the raw transactions into the expected format for revenue import
    const revenueTransactions = transformRawTransactions(data.transactions);
    
    console.log(`Found ${revenueTransactions.length} revenue transactions`);
    console.log("Sample formatted transactions:", revenueTransactions.slice(0, 2));
    
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

/**
 * Transform raw transactions into revenue transactions
 */
function transformRawTransactions(transactions: any[]): ParsedTransaction[] {
  return transactions
    .filter((tx: any) => {
      // Skip rows that don't have proper data
      if (!tx || !tx.preservedColumns) {
        return false;
      }
      
      // Extract and check for credit transactions
      const creditAmount = extractCreditAmount(tx);
      return creditAmount > 0;
    })
    .map((tx: any) => {
      // Extract transaction details
      const txDate = extractDate(tx);
      const description = extractDescription(tx);
      const amount = extractAmount(tx);
      
      // Create a source suggestion based on the description
      // Use the AI-suggested source if available
      const sourceSuggestion = tx.sourceSuggestion || suggestRevenueSource(description);
      
      return {
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: txDate,
        description: description,
        amount: amount,
        type: "credit" as const,
        selected: true,
        sourceSuggestion,
        // Preserve original data
        originalDate: tx.originalDate || tx.date,
        originalAmount: tx.originalAmount || tx.amount,
        preservedColumns: tx.preservedColumns || {}
      };
    });
}
