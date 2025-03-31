
// AI service for formatting transactions while preserving original data
import { Transaction } from './types.ts';

// Function to format transactions using AI while preserving original data
export async function formatTransactionsWithAI(
  transactions: Transaction[],
  context?: string | null
): Promise<Transaction[]> {
  try {
    console.log(`Formatting ${transactions.length} transactions with AI`);
    
    // Create a copy of all transactions with standardized structure
    // This preserves all the original data in preservedColumns
    return transactions.map(transaction => {
      // Create a copy of all original data to preserve
      const preservedColumns = { ...transaction };
      
      // Generate a unique ID if one is not provided
      const id = transaction.id || `tx-${crypto.randomUUID()}`;
      
      // Handle date: use date property or fallbacks to other common date fields
      const dateValue = transaction.date || 
                       transaction.transactionDate || 
                       transaction.valueDate || 
                       transaction.postingDate || 
                       transaction.bookingDate || 
                       new Date().toISOString();
      
      // Handle description: use description or fallbacks to other common description fields
      const description = transaction.description || 
                         transaction.narrative || 
                         transaction.details || 
                         transaction.memo || 
                         transaction.reference || 
                         transaction.merchantName || 
                         'Unknown Transaction';
                         
      // Handle amount: convert to number if possible
      let amount = 0;
      if (typeof transaction.amount === 'number') {
        amount = transaction.amount;
      } else if (transaction.amount !== undefined) {
        // Try to parse the amount as a number if it's a string
        amount = parseFloat(String(transaction.amount).replace(/[^0-9.-]+/g, ''));
      } else if (transaction.debit && parseFloat(String(transaction.debit)) > 0) {
        // If there's a debit field, use that as a negative amount
        amount = -parseFloat(String(transaction.debit));
      } else if (transaction.credit && parseFloat(String(transaction.credit)) > 0) {
        // If there's a credit field, use that as a positive amount
        amount = parseFloat(String(transaction.credit));
      } else if (transaction.value) {
        // Try value field as a fallback
        amount = parseFloat(String(transaction.value));
      }
      
      // Determine transaction type based on amount or explicit type
      let type = transaction.type;
      if (!type) {
        if (amount < 0) {
          type = 'debit';
        } else if (amount > 0) {
          type = 'credit';
        } else {
          type = 'unknown';
        }
      }
      
      // Determine if the transaction should be selected by default
      const selected = transaction.selected !== undefined ? 
                      transaction.selected : 
                      (type === 'debit');
                      
      // For category, use the existing one or leave blank for the user to fill
      const category = transaction.category || "";
      
      // For source, preserve if exists or leave blank
      const source = transaction.source || "";

      // Create the standardized transaction object with all original data preserved
      const standardizedTransaction = {
        id,
        date: dateValue,
        description,
        amount: isNaN(amount) ? 0 : amount,
        type,
        category,
        selected,
        source,
        
        // Store the original values explicitly
        originalDate: transaction.date,
        originalAmount: transaction.amount,
        
        // Store all original data
        preservedColumns
      };
      
      return standardizedTransaction;
    });
  } catch (error) {
    console.error("Error formatting transactions with AI:", error);
    // Return original transactions if formatting fails
    return transactions;
  }
}
