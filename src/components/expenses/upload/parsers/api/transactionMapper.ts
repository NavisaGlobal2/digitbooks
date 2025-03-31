
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from '../../parsers/types';

// Fix the excessive type depth by simplifying the return type
export const mapApiResponseToTransactions = (apiResponse: any): ParsedTransaction[] => {
  if (!apiResponse || !apiResponse.transactions || !Array.isArray(apiResponse.transactions)) {
    return [];
  }

  return apiResponse.transactions.map((transaction: any) => {
    // Create a valid ParsedTransaction object with required fields
    const parsedTransaction: ParsedTransaction = {
      id: transaction.id || uuidv4(),
      date: transaction.date || new Date().toISOString(),
      description: transaction.description || '',
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type === 'credit' ? 'credit' : 'debit',
      selected: transaction.type === 'debit',
      category: transaction.category
    };

    // If there's a suggestion, add it
    if (transaction.categorySuggestion) {
      parsedTransaction.categorySuggestion = {
        category: transaction.categorySuggestion.category,
        confidence: transaction.categorySuggestion.confidence || 0
      };
    }

    return parsedTransaction;
  });
};

// Map batch ID separately to avoid type issues
export const attachBatchIdToTransactions = (
  transactions: ParsedTransaction[], 
  batchId: string
): ParsedTransaction[] => {
  return transactions.map(transaction => ({
    ...transaction,
    batchId
  }));
};
