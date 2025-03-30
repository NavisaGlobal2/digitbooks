
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
  
  if (!result.transactions || !Array.isArray(result.transactions) || result.transactions.length === 0) {
    trackFailedConnection('no_transactions', { result });
    throw new Error("No transactions were found in the uploaded file");
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
  
  onSuccess(transactions);
  return true;
};
