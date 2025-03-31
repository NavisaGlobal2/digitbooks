/**
 * Utility functions for transaction data processing
 */
import { Transaction } from '../types.ts';

// Merge AI processed data with original transaction data to preserve all fields
export function mergeTransactionData(
  originalTransactions: Transaction[], 
  aiProcessedData: any[]
): Transaction[] {
  return originalTransactions.map((originalTx, index) => {
    const aiTx = aiProcessedData[index] || {};
    
    // Generate a unique ID if one is not provided
    const id = originalTx.id || `tx-${crypto.randomUUID()}`;
    
    // Preserve original values but prefer AI formatted values if available
    const mergedTransaction = {
      id,
      date: aiTx.date || originalTx.date || new Date().toISOString(),
      description: aiTx.description || originalTx.description || "Unknown Transaction",
      amount: typeof aiTx.amount === "number" ? aiTx.amount : 
            (typeof originalTx.amount === "number" ? originalTx.amount : 0),
      type: aiTx.type || originalTx.type || (
        (typeof aiTx.amount === "number" && aiTx.amount < 0) || 
        (typeof originalTx.amount === "number" && originalTx.amount < 0) ? 
        "debit" : "credit"
      ),
      
      // Additional fields that might be added by the AI
      category: aiTx.category || originalTx.category || "",
      selected: aiTx.selected !== undefined ? aiTx.selected : 
              (originalTx.selected !== undefined ? originalTx.selected : 
              (aiTx.type === "debit" || originalTx.type === "debit")),
      source: aiTx.source || originalTx.source || "",
      
      // Store any source suggestions from AI
      sourceSuggestion: aiTx.sourceSuggestion,
      categorySuggestion: aiTx.categorySuggestion,
      
      // Store the original values explicitly
      originalDate: originalTx.date,
      originalAmount: originalTx.amount,
      
      // Store all original data
      preservedColumns: { ...originalTx }
    };
    
    // Log first merged transaction to show the final result
    if (index === 0) {
      console.log("SAMPLE MERGED TRANSACTION:", 
        JSON.stringify(mergedTransaction, null, 2));
    }
    
    return mergedTransaction;
  });
}

// Filter out invalid transactions (unknown transactions with zero amount)
export function filterInvalidTransactions(transactions: Transaction[]): Transaction[] {
  // Count before filtering for logging
  const beforeCount = transactions.length;
  
  // Filter out transactions with zero amount and "Unknown Transaction" description
  const filteredTx = transactions.filter(tx => {
    // Check if this is a zero-value "Unknown Transaction"
    const isUnknownZeroValue = 
      (tx.amount === 0 || tx.amount === undefined || tx.amount === null) && 
      (tx.description === "Unknown Transaction" || !tx.description);
      
    // Keep transactions that are not unknown zero-value
    return !isUnknownZeroValue;
  });
  
  // Log the filtering results
  const removedCount = beforeCount - filteredTx.length;
  if (removedCount > 0) {
    console.log(`Filtered out ${removedCount} invalid transactions (zero-value "Unknown Transaction")`);
  }
  
  return filteredTx;
}

// Log sample transactions for debugging
export function logSampleTransactions(
  transactions: any[], 
  label: string, 
  sampleSize: number = 2
): void {
  if (transactions && Array.isArray(transactions) && transactions.length > 0) {
    console.log(`${label}:`, 
      JSON.stringify(transactions.slice(0, sampleSize), null, 2));
  } else {
    console.log(`${label}: No valid data or empty array`);
  }
}
