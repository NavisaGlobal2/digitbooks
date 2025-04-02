
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[], metadata?: any) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  useAIFormatting: boolean = true,
  context: string = 'expense',
  preferredProvider: string = 'anthropic'
) => {
  try {
    // Check authentication status
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return onError("Authentication required. Please sign in to continue.");
    }

    console.log(`Starting edge function parsing for ${file.name} (${file.type}, ${file.size} bytes)`);
    console.log(`Using context: ${context}, AI formatting: ${useAIFormatting ? 'enabled' : 'disabled'}, Provider: ${preferredProvider}`);

    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    formData.append('preferredProvider', preferredProvider);
    formData.append('useAIFormatting', String(useAIFormatting));
    formData.append('fileName', file.name);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      return onError(error.message || "Error processing file on server");
    }

    if (!data || data.error) {
      console.error("Data processing error:", data?.error || "Unknown error");
      return onError(data?.error || "Error processing transactions");
    }

    // Log transaction data for debugging
    console.log(`Edge function response:`, data);
    console.log(`Received ${data.transactions?.length || 0} transactions`);

    if (!data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      console.error("No transactions found in response", data);
      return onError("No valid transactions found in the uploaded file. Please check the file format.");
    }

    // Filter out invalid transactions (zero amount and unknown description)
    const validTransactions = data.transactions.filter((tx: any) => {
      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || "0");
      const hasValidAmount = !isNaN(amount) && amount !== 0;
      const hasValidDescription = tx.description && tx.description !== "Unknown transaction";
      return hasValidAmount && hasValidDescription;
    });

    if (validTransactions.length === 0) {
      console.error("No valid transactions after filtering", data);
      return onError("No valid transactions found in the uploaded file. All transactions had zero amounts or missing descriptions.");
    }

    // Ensure each transaction has the required fields
    const processedTransactions = validTransactions.map((tx: any, index: number) => {
      // Parse amount to ensure it's a number
      const parsedAmount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || "0");
      
      // Create a valid transaction object with defaults for missing fields
      return {
        id: tx.id || `tx-${index}-${Date.now()}`,
        date: tx.date || new Date().toISOString(),
        description: tx.description || "Transaction " + (index + 1),
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        type: tx.type || (parsedAmount < 0 ? "debit" : "credit"),
        selected: tx.type === "debit" || parsedAmount < 0,
        category: tx.category || "",
        source: tx.source || "",
        originalDate: tx.originalDate || tx.date,
        originalAmount: tx.originalAmount || tx.amount,
        preservedColumns: tx.preservedColumns || {}
      };
    });

    if (completeProgress) {
      completeProgress();
    }

    console.log(`Successfully parsed and processed ${processedTransactions.length} transactions`);
    
    // Return both the transactions and any additional metadata
    onSuccess(processedTransactions, {
      message: `Successfully processed ${processedTransactions.length} transactions`,
      ...data
    });
    
    return true;
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    
    if (resetProgress) {
      resetProgress();
    }
    
    return onError(`Failed to process file: ${error.message}`);
  }
};
