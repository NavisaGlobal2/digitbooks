
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  isCancelled?: boolean,
  setIsWaitingForServer?: (isWaiting: boolean) => void,
  preferredProvider?: string,
  useAIFormatting: boolean = true // Parameter to control AI formatting
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
    formData.append('context', 'general');
    formData.append('useAIFormatting', useAIFormatting.toString()); // Add the formatting option
    
    // Add preferred AI provider if specified
    if (preferredProvider) {
      formData.append('preferredProvider', preferredProvider);
    }

    console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes) via edge function with AI formatting ${useAIFormatting ? 'enabled' : 'disabled'}`);

    // Set waiting flag if provided
    if (setIsWaitingForServer) {
      setIsWaitingForServer(true);
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    // Clear waiting flag if provided
    if (setIsWaitingForServer) {
      setIsWaitingForServer(false);
    }

    // Check for cancellation
    if (isCancelled) {
      console.log("Processing cancelled by user");
      return;
    }

    if (error) {
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      onError("No transactions found in file");
      return;
    }

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Map API response to transactions with consistent format
    // Note: AI formatting should have already prepared this structure properly
    const transactions = data.transactions.map((tx: any, index: number) => ({
      id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
      date: tx.date || new Date().toISOString(),
      description: tx.description || `Unknown transaction ${index + 1}`,
      amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || '0'),
      type: tx.type || (parseFloat(tx.amount || '0') < 0 ? "debit" : "credit"),
      selected: tx.selected !== undefined ? tx.selected : (tx.type === "debit" || parseFloat(tx.amount || '0') < 0),
      category: tx.category || "",
      source: tx.source || "",
      
      // Preserve original values if present
      originalDate: tx.originalDate || tx.date,
      originalAmount: tx.originalAmount || tx.amount,
      preservedColumns: tx.preservedColumns || {}
    }));

    console.log(`Successfully parsed ${transactions.length} transactions with AI formatting: ${data.formattingApplied ? 'applied' : 'not applied'}`);
    
    // Send the transactions to the caller
    onSuccess(transactions);
  } catch (error: any) {
    // Reset progress if provided
    if (resetProgress) {
      resetProgress();
    }
    
    // Clear waiting flag if provided
    if (setIsWaitingForServer) {
      setIsWaitingForServer(false);
    }
    
    console.error("Error in parseViaEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
