
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
    type: transaction.type || 'debit',
    selected: false // Always initialize with selected=false
  })) as ParsedTransaction[];
};

/**
 * Validates a transaction object to ensure it has all required fields
 */
export const validateTransaction = (transaction: Partial<ParsedTransaction>): boolean => {
  if (!transaction.id) {
    console.error("Transaction is missing an ID");
    return false;
  }
  
  if (!transaction.date) {
    console.error(`Transaction ${transaction.id} is missing a date`);
    return false;
  }
  
  if (!transaction.description) {
    console.error(`Transaction ${transaction.id} is missing a description`);
    return false;
  }
  
  if (transaction.amount === undefined) {
    console.error(`Transaction ${transaction.id} is missing an amount`);
    return false;
  }
  
  if (!transaction.type) {
    console.error(`Transaction ${transaction.id} is missing a type`);
    return false;
  }
  
  return true;
};

/**
 * Ensures all transactions in an array have unique IDs
 * and adds debugging information
 */
export const prepareTransactionsForUI = (transactions: ParsedTransaction[]): ParsedTransaction[] => {
  // First ensure all transactions have IDs
  const withIds = transactions.map(t => ({
    ...t,
    id: t.id || uuidv4()
  }));
  
  // Log transaction IDs for debugging
  console.log(`Prepared ${withIds.length} transactions for UI with IDs:`);
  withIds.forEach((t, index) => {
    if (index < 5 || index === withIds.length - 1) {
      console.log(`Transaction ${index}: ID=${t.id}, Amount=${t.amount}, Type=${t.type}`);
    } else if (index === 5) {
      console.log(`... and ${withIds.length - 5} more transactions`);
    }
  });
  
  return withIds;
};
