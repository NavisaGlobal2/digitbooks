
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
    const dateObj = typeof transactionDate === 'string' 
      ? new Date(transactionDate) 
      : transactionDate instanceof Date 
        ? transactionDate 
        : new Date(transaction.date);
    
    return {
      id: uuidv4(), // Generate a new ID for each expense
      amount: Math.abs(transaction.amount), // Ensure amount is positive
      date: dateObj, // Use the original date format when possible
      description: transaction.description,
      category: transaction.category as ExpenseCategory, // Type cast to ExpenseCategory
      vendor: inferVendorFromDescription(transaction.description),
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
