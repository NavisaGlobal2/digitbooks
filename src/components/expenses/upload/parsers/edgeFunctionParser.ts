
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[], responseData?: any) => void,
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

    if (!data) {
      console.error("No data returned from server");
      onError("No response from server. Please try again.");
      return;
    }

    console.log("Server response:", data);

    if (!data.transactions || !Array.isArray(data.transactions)) {
      console.error("Invalid response format:", data);
      onError("Invalid response from server. Expected transactions array.");
      return;
    }

    if (data.transactions.length === 0) {
      console.warn("No transactions found in file");
      onError("No transactions found in file. Please check the file format.");
      return;
    }

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Filter out invalid transactions (those with null/empty required fields or current dates)
    const currentYear = new Date().getFullYear();
    const filteredTransactions = data.transactions.filter((tx: any) => {
      // Check if it has a valid date (not null/undefined and not current date)
      const txDate = tx.date ? new Date(tx.date) : null;
      const isCurrentYearDate = txDate && txDate.getFullYear() === currentYear;
      const isValidDate = txDate && !isNaN(txDate.getTime());
      
      // Check if amount is valid (not zero, null or undefined)
      const hasAmount = tx.amount !== 0 && tx.amount !== null && tx.amount !== undefined;
      
      // Check if description is valid (not "Unknown Transaction" or empty)
      const hasDescription = tx.description && 
                            tx.description !== "Unknown Transaction" && 
                            tx.description !== "Unknown transaction";
      
      // Only include transaction if it has valid date, amount, and description
      return isValidDate && hasAmount && hasDescription;
    });
    
    if (filteredTransactions.length === 0) {
      console.error("All transactions were filtered out as invalid");
      onError("Could not find valid transactions in the file. Please check the file format or try again.");
      return;
    }

    // Log filtering results
    console.log(`Filtered ${data.transactions.length - filteredTransactions.length} invalid transactions`);
    console.log(`Processing ${filteredTransactions.length} valid transactions`);

    // Ensure transaction objects have all required fields
    const transactions = filteredTransactions.map((tx: any, index: number) => ({
      id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
      date: tx.date || new Date().toISOString().split('T')[0],
      description: tx.description || `Transaction ${index + 1}`,
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
    console.log("Sample transaction:", transactions[0]);
    
    // Extract metadata to return
    const responseMetadata = {
      count: transactions.length,
      batchId: data.batchId,
      formattingApplied: data.formattingApplied,
      originalFormat: data.originalFormat,
      fileDetails: data.fileDetails,
      message: data.message,
      originalCount: data.transactions.length,
      filteredCount: data.transactions.length - filteredTransactions.length
    };
    
    // Send the transactions to the caller along with metadata
    onSuccess(transactions, responseMetadata);
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
