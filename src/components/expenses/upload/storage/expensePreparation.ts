
import { ParsedTransaction } from '../parsers/types';
import { ExpenseCategory } from '@/types/expense';

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
      id: crypto.randomUUID(), // Generate a new ID for each expense
      amount, // Use the validated amount
      date: dateObj, // Use the properly parsed date
      description, // Use the extracted description
      category: category as ExpenseCategory, // Type cast to ExpenseCategory
      vendor: inferVendorFromDescription(description),
      status: "pending", // Use "pending" status to match ExpenseStatus type
      paymentMethod: "bank transfer",
      fromStatement: true,
      batchId: batchId,
      notes: `Imported from bank statement: ${fileName}`,
    };
  });
};

/**
 * Try to extract vendor name from transaction description
 */
function inferVendorFromDescription(description: string): string {
  // Simple extraction of likely vendor name from description
  const cleanDesc = description.trim();
  
  // Look for common patterns in bank statement descriptions
  const patterns = [
    // POS pattern: "POS Purchase at VENDOR NAME"
    /(?:POS|purchase|payment)(?:\s+at|\s+to|\s+for)\s+([A-Za-z0-9\s]+)/i,
    // Transfer pattern: "Transfer to VENDOR NAME"
    /(?:transfer|sent|paid)(?:\s+to|\s+for)\s+([A-Za-z0-9\s]+)/i,
    // Debit pattern: "Debit for VENDOR NAME"
    /(?:debit|charge)(?:\s+for|\s+from|\s+to)\s+([A-Za-z0-9\s]+)/i,
    // Simple vendor after a common prefix
    /(?:pmt to|payment to|to:)\s+([A-Za-z0-9\s]+)/i
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = cleanDesc.match(pattern);
    if (match && match[1]) {
      // Clean up the vendor name (first 30 chars, trim spaces)
      return match[1].trim().substring(0, 30);
    }
  }
  
  // Fallback: Use the first part of the description if no pattern matches
  // This often works because many banks put the merchant name first
  const words = cleanDesc.split(/\s+/);
  if (words.length >= 2) {
    const possibleVendor = words.slice(0, 2).join(' ');
    return possibleVendor.replace(/[^A-Za-z0-9\s]/g, '').trim().substring(0, 30);
  }
  
  // Final fallback: Use "Unknown" for really unclear descriptions
  return "Unknown Vendor";
}
