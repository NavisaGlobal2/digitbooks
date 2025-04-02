
import { ParsedTransaction } from '../parsers/types';
import { ExpenseCategory, ExpenseStatus } from '@/types/expense';
import { inferVendorFromDescription } from './vendorInference';

export const prepareExpensesFromTransactions = (
  transactions: ParsedTransaction[],
  batchId: string,
  fileName: string
) => {
  // Only create expenses from selected transactions that are debits
  const selectedDebits = transactions.filter(t => t.selected && t.type === 'debit');
  
  console.log(`Preparing ${selectedDebits.length} expenses from ${transactions.length} transactions`);

  return selectedDebits.map(transaction => {
    // Use originalDate if available, otherwise use the processed date
    const transactionDate = transaction.originalDate || transaction.date;
    
    // Convert to Date object - but handle string or Date inputs
    let dateObj: Date;
    
    if (transactionDate instanceof Date) {
      // If it's already a Date object, use it directly
      dateObj = transactionDate;
    } else if (typeof transactionDate === 'string') {
      try {
        // Try to parse the date string
        dateObj = new Date(transactionDate);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn(`Invalid date: ${transactionDate}, using current date`);
          dateObj = new Date();
        }
      } catch (e) {
        console.warn(`Failed to parse date '${transactionDate}', using current date instead`);
        dateObj = new Date();
      }
    } else {
      // Fallback if we have neither Date nor string
      dateObj = new Date();
    }
    
    // Get amount and ensure it's positive for expenses
    let amount: number;
    try {
      if (typeof transaction.amount === 'number') {
        amount = Math.abs(transaction.amount);
      } else if (typeof transaction.amount === 'string') {
        amount = Math.abs(parseFloat(transaction.amount));
      } else {
        amount = 0;
      }
    } catch (e) {
      console.warn(`Failed to parse amount: ${transaction.amount}, using 0`);
      amount = 0;
    }
    
    // Get description from original data if available
    const description = transaction.preservedColumns?.description || 
                        transaction.preservedColumns?.narrative ||
                        transaction.description || 
                        "Unknown transaction";
    
    // Default category if none is provided
    const category = transaction.category || "other";
    
    // Create the expense object using the original data where possible
    return {
      amount, // Use the validated amount
      date: dateObj, // Use the properly parsed date
      description, // Use the extracted description
      category: category as ExpenseCategory, // Type cast to ExpenseCategory
      vendor: inferVendorFromDescription(description),
      status: "pending" as ExpenseStatus, // Explicitly cast to ExpenseStatus
      paymentMethod: "bank transfer" as "bank transfer", // Explicitly type as a literal
      fromStatement: true,
      batchId: batchId,
      notes: `Imported from bank statement: ${fileName}`,
    };
  });
};
