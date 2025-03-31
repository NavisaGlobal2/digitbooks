
// AI service for formatting transactions without altering the original data
import { Transaction } from './types.ts';

// Function to format transactions using AI while preserving original data
export async function formatTransactionsWithAI(
  transactions: Transaction[],
  context?: string | null
): Promise<Transaction[]> {
  try {
    console.log(`Formatting ${transactions.length} transactions with AI`);
    
    // Here we'd integrate with an AI service
    // But for now, we'll just do some basic standardization manually
    // This preserves all the original data but puts it in a consistent format
    
    return transactions.map(transaction => {
      // Create a copy of all original data to preserve
      const preservedColumns = { ...transaction };
      
      // Extract the key properties we need in a standardized format
      const standardizedTransaction = {
        id: transaction.id || `tx-${crypto.randomUUID()}`,
        date: transaction.date || transaction.transactionDate || transaction.valueDate || new Date().toISOString(),
        description: transaction.description || transaction.narrative || transaction.details || transaction.merchantName || 'Unknown Transaction',
        amount: typeof transaction.amount === 'number' ? transaction.amount : 
                parseFloat(String(transaction.amount || transaction.value || transaction.debit || transaction.credit || '0')),
        type: transaction.type || (Number(transaction.amount || 0) < 0 ? 'debit' : 'credit'),
        category: transaction.category || null,
        selected: transaction.selected !== undefined ? transaction.selected : 
                 (transaction.type === 'debit' || Number(transaction.amount || 0) < 0),
        source: transaction.source || '',
        
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
