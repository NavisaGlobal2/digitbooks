
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

    // Ensure transaction objects have all required fields and filter out invalid entries
    const transactions = data.transactions
      .map((tx: any, index: number) => ({
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
      }))
      // Filter out invalid transactions (those with "Unknown" description and zero amount)
      .filter(tx => {
        // Skip header rows and summary rows (typically have "Unknown" descriptions and zero amounts)
        const isInvalidEntry = 
          (tx.description.includes("Unknown transaction") && tx.amount === 0) || 
          (!tx.description && tx.amount === 0) ||
          (tx.description === "Unknown Transaction" && tx.amount === 0);
        
        // Also filter out rows that appear to be headers or summaries based on their preserved columns
        const isSummaryOrHeader = tx.preservedColumns && 
          Object.values(tx.preservedColumns).some(value => 
            typeof value === 'string' && 
            (value.includes("Summary") || 
             value.includes("Date/Time") || 
             value.includes("Balance") ||
             value.includes("Money in") && value.includes("Money out")));
        
        return !isInvalidEntry && !isSummaryOrHeader;
      });

    if (transactions.length === 0) {
      console.warn("All transactions were filtered out as invalid");
      onError("No valid transactions found in the statement. Please try a different file or format.");
      return;
    }

    console.log(`Successfully parsed ${transactions.length} valid transactions with AI formatting: ${data.formattingApplied ? 'applied' : 'not applied'}`);
    console.log("Sample transaction:", transactions[0]);
    
    // Extract metadata to return
    const responseMetadata = {
      count: transactions.length, // Update count to reflect filtered transactions
      batchId: data.batchId,
      formattingApplied: data.formattingApplied,
      originalFormat: data.originalFormat,
      fileDetails: data.fileDetails,
      message: `Successfully processed ${transactions.length} valid transactions`
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
