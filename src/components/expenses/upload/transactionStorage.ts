
import { ParsedTransaction } from "./parsers/types";
import { Expense } from "@/types/expense";
import { v4 as uuidv4 } from "uuid";
import { saveTransactionsToDatabase } from "./storage/databaseOperations";
import { ExpenseCategory } from "@/types/expense";

export { saveTransactionsToDatabase } from "./storage/databaseOperations";

/**
 * Prepare expense objects from parsed transactions
 */
export const prepareExpensesFromTransactions = (
  transactions: ParsedTransaction[],
  batchId: string,
  sourceFileName: string
): Expense[] => {
  // Only create expenses from selected transactions that have categories
  const selectedAndTagged = transactions.filter(
    (t) => t.selected && t.category && t.type === 'debit'
  );

  console.log(`Preparing ${selectedAndTagged.length} expenses from ${transactions.length} transactions`);

  return selectedAndTagged.map((transaction) => {
    // Use originalDate if available, otherwise use the processed date
    const transactionDate = transaction.originalDate || transaction.date;
    
    // Convert to Date object - but handle string or Date inputs
    // Important: Try to preserve the exact date format from the original Excel
    let dateObj: Date;
    
    if (transactionDate instanceof Date) {
      // If it's already a Date object, use it directly
      dateObj = transactionDate;
    } else if (typeof transactionDate === 'string') {
      // Handle different date formats from Excel
      // Try to parse the date in a way that respects the original format
      if (transactionDate.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
        // Format like MM/DD/YYYY or DD/MM/YYYY
        const parts = transactionDate.split('/');
        // If the last part is a 2-digit year, convert it to 4 digits
        if (parts[2].length === 2) {
          parts[2] = '20' + parts[2];
        }
        // Try both MM/DD/YYYY and DD/MM/YYYY interpretations
        // (browser default usually interprets as MM/DD/YYYY)
        dateObj = new Date(transactionDate);
      } else if (transactionDate.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        // Format like YYYY-MM-DD (ISO format)
        dateObj = new Date(transactionDate);
      } else {
        // For any other format, use the built-in parser
        // but be careful with ambiguous formats
        try {
          dateObj = new Date(transactionDate);
        } catch (e) {
          // If parsing fails, use current date as fallback
          console.warn(`Failed to parse date '${transactionDate}', using current date instead`);
          dateObj = new Date();
        }
      }
    } else {
      // Fallback if we have neither Date nor string
      dateObj = new Date();
    }
    
    // Get original amount if available for display
    const displayAmount = transaction.originalAmount || transaction.amount;
    
    // Get description from original data if available
    const description = transaction.preservedColumns?.description || 
                        transaction.preservedColumns?.narrative ||
                        transaction.description;
    
    // Create the expense object using the original data where possible
    return {
      id: uuidv4(), // Generate a new ID for each expense
      amount: Math.abs(transaction.amount), // Ensure amount is positive
      date: dateObj, // Use the properly parsed date
      description: description,
      category: transaction.category as ExpenseCategory, // Type cast to ExpenseCategory
      vendor: inferVendorFromDescription(description),
      status: "pending", // Changed from "completed" to "pending" to match ExpenseStatus type
      paymentMethod: "bank transfer",
      fromStatement: true,
      batchId: batchId,
      notes: `Imported from bank statement: ${sourceFileName}`,
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
