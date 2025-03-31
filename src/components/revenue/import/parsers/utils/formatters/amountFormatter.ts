
/**
 * Helper functions for extracting and formatting amounts from transactions
 */

import { determineTransactionType } from './typeFormatter';

/**
 * Helper function to extract credit amount from transaction
 */
export function extractCreditAmount(tx: any): number {
  // First check if we already have a processed amount from AI formatting
  if (tx.amount !== undefined && tx.type === 'credit') {
    return typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount);
  }
  
  if (tx.preservedColumns) {
    // Try common credit amount fields
    const possibleCreditFields = [
      "CREDIT", 
      "__EMPTY_3", 
      "Credit Amount",
      "CREDIT AMOUNT", 
      "INFLOW",
      "Money In",
      "Deposit"
    ];
    
    for (const field of possibleCreditFields) {
      if (tx.preservedColumns[field]) {
        const amountStr = tx.preservedColumns[field].toString();
        if (amountStr) {
          // Clean the string and parse as float
          const cleanAmount = amountStr.replace(/[^\d.-]/g, '');
          if (cleanAmount) {
            return parseFloat(cleanAmount);
          }
        }
      }
    }
  }
  
  return 0;
}

/**
 * Helper function to extract debit amount from transaction
 */
export function extractDebitAmount(tx: any): number {
  // First check if we already have a processed amount from AI formatting
  if (tx.amount !== undefined && tx.type === 'debit') {
    const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount);
    return Math.abs(amount); // Make sure it's positive
  }
  
  if (tx.preservedColumns) {
    // Try common debit amount fields
    const possibleDebitFields = [
      "DEBIT", 
      "__EMPTY_2", 
      "Debit Amount",
      "DEBIT AMOUNT", 
      "OUTFLOW",
      "Money Out",
      "Withdrawal"
    ];
    
    for (const field of possibleDebitFields) {
      if (tx.preservedColumns[field]) {
        const amountStr = tx.preservedColumns[field].toString();
        if (amountStr) {
          // Clean the string and parse as float
          const cleanAmount = amountStr.replace(/[^\d.-]/g, '');
          if (cleanAmount) {
            return parseFloat(cleanAmount);
          }
        }
      }
    }
  }
  
  return 0;
}

/**
 * Helper function to extract amount (handles both credit and debit)
 */
export function extractAmount(tx: any): number {
  // First try to use the AI-formatted amount if available
  if (typeof tx.amount === 'number') {
    return Math.abs(tx.amount); // Convert negative to positive
  }
  
  if (tx.amount && typeof tx.amount === 'string') {
    const parsedAmount = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsedAmount)) {
      return Math.abs(parsedAmount);
    }
  }
  
  const type = determineTransactionType(tx);
  
  if (type === 'credit') {
    const creditAmount = extractCreditAmount(tx);
    if (creditAmount > 0) {
      return creditAmount;
    }
  } else {
    const debitAmount = extractDebitAmount(tx);
    if (debitAmount > 0) {
      return debitAmount;
    }
  }
  
  return 0;
}
