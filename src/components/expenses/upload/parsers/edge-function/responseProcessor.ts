
import { ParsedTransaction } from "../types";
import { trackFailedConnection } from "./connectionStats";

/**
 * Process a successful response from the edge function
 */
export const processSuccessfulResult = (
  result: any, 
  onSuccess: (transactions: ParsedTransaction[]) => void
): boolean => {
  console.log("Edge function result:", result);
  
  if (!result.success) {
    trackFailedConnection('processing_error', { result });
    throw new Error(result.error || "Unknown error processing file");
  }
  
  // Check for diagnostic data that might have been returned for debugging
  if (result.diagnostics) {
    console.log("Google Vision API Diagnostics:", result.diagnostics);
    
    if (result.diagnostics.visionApiStatus && result.diagnostics.visionApiStatus !== 200) {
      throw new Error(`Google Vision API returned status: ${result.diagnostics.visionApiStatus}`);
    }
    
    if (result.diagnostics.errorDetails) {
      throw new Error(`Google Vision API error: ${result.diagnostics.errorDetails}`);
    }
  }
  
  if (!result.transactions || !Array.isArray(result.transactions)) {
    console.log("No transactions found or invalid transactions array");
    onSuccess([]);
    return true;
  }
  
  if (result.transactions.length === 0) {
    console.log("Empty transactions array returned - no transactions found");
    onSuccess([]);
    return true;
  }
  
  console.log(`Successfully parsed ${result.transactions.length} transactions`);
  
  // Process the transactions
  const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    type: tx.type || (tx.amount < 0 ? "debit" : "credit"),
    selected: tx.type === "debit", // Pre-select debits by default
    category: tx.category || "",
    source: tx.source || ""
  }));
  
  // Filter out any transactions with missing required fields
  const validTransactions = transactions.filter(tx => {
    // Ensure we have valid date
    const hasValidDate = tx.date && String(tx.date).trim() !== '';
    
    // Ensure we have valid description
    const hasValidDescription = tx.description && String(tx.description).trim() !== '';
    
    // Ensure we have valid amount
    const hasValidAmount = tx.amount !== undefined && 
                         tx.amount !== null && 
                         !isNaN(parseFloat(String(tx.amount)));
    
    if (!hasValidDate || !hasValidDescription || !hasValidAmount) {
      console.log(`Filtering out invalid transaction: ${JSON.stringify(tx)}`);
      return false;
    }
    
    return true;
  });
  
  console.log(`After validation: ${validTransactions.length} of ${transactions.length} transactions are valid`);
  
  onSuccess(validTransactions);
  return true;
};
