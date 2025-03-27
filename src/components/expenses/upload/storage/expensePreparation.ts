
import { ParsedTransaction } from '../parsers/types';
import { ExpenseCategory } from '@/types/expense';
import { v4 as uuidv4 } from 'uuid';

export const prepareExpensesFromTransactions = (
  transactions: ParsedTransaction[],
  batchId: string,
  fileName: string
) => {
  console.log(`Preparing expenses from ${transactions.length} transactions with batch ID ${batchId}`);
  
  // Only include selected transactions with categories
  const eligibleTransactions = transactions.filter(t => t.selected && t.category);
  console.log(`Found ${eligibleTransactions.length} eligible transactions (selected with categories)`);
  
  if (eligibleTransactions.length === 0) {
    console.warn("No eligible transactions found for expense creation");
  }
  
  // Make sure we use a proper UUID for the batch ID
  const properBatchId = batchId.startsWith('batch-') ? uuidv4() : batchId;
  
  return eligibleTransactions.map(transaction => {
    const expense = {
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category as ExpenseCategory,
      status: "pending" as const,
      paymentMethod: "bank transfer" as const,
      vendor: "Bank Statement Import",
      notes: `Imported from bank statement: ${fileName}`,
      fromStatement: true,
      batchId: properBatchId
    };
    
    console.log(`Prepared expense: ${expense.description}, ${expense.amount}, category: ${expense.category}`);
    return expense;
  });
};

