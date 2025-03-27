
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from '../../types';

/**
 * Ensures each transaction has a unique ID
 */
export const ensureTransactionIds = (transactions: Partial<ParsedTransaction>[]): ParsedTransaction[] => {
  return transactions.map(transaction => ({
    ...transaction,
    id: transaction.id || uuidv4(),
    // Set default values for required fields if they're missing
    date: transaction.date || new Date().toISOString(),
    description: transaction.description || 'Unknown transaction',
    amount: transaction.amount || 0,
    type: transaction.type || 'debit'
  })) as ParsedTransaction[];
};

/**
 * Validates a transaction object to ensure it has all required fields
 */
export const validateTransaction = (transaction: Partial<ParsedTransaction>): boolean => {
  return (
    !!transaction.id &&
    !!transaction.date &&
    !!transaction.description &&
    transaction.amount !== undefined &&
    !!transaction.type
  );
};
