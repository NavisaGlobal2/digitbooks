
import { ParsedTransaction } from '../parsers/types';
import { ExpenseCategory } from '@/types/expense';

export const prepareExpensesFromTransactions = (
  transactions: ParsedTransaction[],
  batchId: string,
  fileName: string
) => {
  return transactions
    .filter(t => t.selected && t.category) 
    .map(transaction => ({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category as ExpenseCategory,
      status: "pending" as const,
      paymentMethod: "bank transfer" as const,
      vendor: "Bank Statement Import",
      notes: `Imported from bank statement: ${fileName}`,
      fromStatement: true,
      batchId: batchId
    }));
};
