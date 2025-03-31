
/**
 * Basic formatting functions that don't require AI
 */
import { Transaction } from '../types.ts';

// Basic formatting function as a fallback
export function basicFormatting(transactions: Transaction[]): Transaction[] {
  // Create a copy of all transactions with standardized structure
  return transactions.map(transaction => {
    // Create a copy of all original data to preserve
    const preservedColumns = { ...transaction };
    
    // Generate a unique ID if one is not provided
    const id = transaction.id || `tx-${crypto.randomUUID()}`;
    
    // Handle date: use date property or fallbacks to other common date fields
    const dateValue = transaction.date || 
                     transaction.transactionDate || 
                     transaction.valueDate || 
                     transaction.postingDate || 
                     transaction.bookingDate || 
                     findDateInPreservedColumns(transaction) || 
                     new Date().toISOString();
    
    // Handle description: use description or fallbacks to other common description fields
    const description = transaction.description || 
                       transaction.narrative || 
                       transaction.details || 
                       transaction.memo || 
                       transaction.reference || 
                       transaction.merchantName || 
                       findDescriptionInPreservedColumns(transaction) || 
                       'Unknown Transaction';
                       
    // Handle amount: convert to number if possible
    let amount = 0;
    if (typeof transaction.amount === 'number') {
      amount = transaction.amount;
    } else if (transaction.amount !== undefined) {
      // Try to parse the amount as a number if it's a string
      amount = parseFloat(String(transaction.amount).replace(/[^0-9.-]+/g, ''));
    } else if (transaction.debit && parseFloat(String(transaction.debit)) > 0) {
      // If there's a debit field, use that as a negative amount
      amount = -parseFloat(String(transaction.debit));
    } else if (transaction.credit && parseFloat(String(transaction.credit)) > 0) {
      // If there's a credit field, use that as a positive amount
      amount = parseFloat(String(transaction.credit));
    } else if (transaction.value) {
      // Try value field as a fallback
      amount = parseFloat(String(transaction.value));
    } else {
      // Try to find amount in preserved columns
      amount = findAmountInPreservedColumns(transaction);
    }
    
    // Determine transaction type based on amount or explicit type
    let type = transaction.type;
    if (!type) {
      if (amount < 0) {
        type = 'debit';
      } else if (amount > 0) {
        type = 'credit';
      } else {
        type = 'unknown';
      }
    }
    
    // Determine if the transaction should be selected by default
    const selected = transaction.selected !== undefined ? 
                    transaction.selected : 
                    (type === 'debit');
                    
    // For category, use the existing one or leave blank for the user to fill
    const category = transaction.category || "";
    
    // For source, preserve if exists or leave blank
    const source = transaction.source || "";

    // Create the standardized transaction object with all original data preserved
    return {
      id,
      date: dateValue,
      description,
      amount: isNaN(amount) ? 0 : amount,
      type,
      category,
      selected,
      source,
      
      // Store the original values explicitly
      originalDate: transaction.date,
      originalAmount: transaction.amount,
      
      // Store all original data
      preservedColumns
    };
  });
}

// Helper function to search for date values in preserved columns
function findDateInPreservedColumns(transaction: Transaction): string | null {
  // Skip if no preserved columns
  if (!transaction.preservedColumns) return null;
  
  const preservedColumns = transaction.preservedColumns;
  
  // Search for date patterns in preserved columns
  for (const key in preservedColumns) {
    const value = preservedColumns[key];
    if (!value) continue;
    
    // Check if it's a date string (DD/MM/YYYY or YYYY-MM-DD etc.)
    const strValue = String(value);
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(strValue) || 
        /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(strValue)) {
      
      try {
        // Try to parse as date
        const date = new Date(strValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        // Failed to parse, continue searching
      }
    }
  }
  
  return null;
}

// Helper function to search for description values in preserved columns
function findDescriptionInPreservedColumns(transaction: Transaction): string | null {
  // Skip if no preserved columns
  if (!transaction.preservedColumns) return null;
  
  const preservedColumns = transaction.preservedColumns;
  
  // Keywords that might indicate a description field
  const descKeywords = ['narration', 'description', 'details', 'particulars', 'memo', 'narrative', 'reference'];
  
  // First try to find columns with description keywords
  for (const key in preservedColumns) {
    const lowerKey = key.toLowerCase();
    if (descKeywords.some(keyword => lowerKey.includes(keyword))) {
      const value = preservedColumns[key];
      if (value && typeof value === 'string' && value.length > 3) {
        return value;
      }
    }
  }
  
  // If no match found, look for the longest string value
  let longestString = "";
  for (const key in preservedColumns) {
    const value = preservedColumns[key];
    if (value && typeof value === 'string' && value.length > longestString.length && value.length > 3) {
      // Skip values that look like dates or amounts
      if (!/^\d+(\.\d+)?$/.test(value) && 
          !/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(value)) {
        longestString = value;
      }
    }
  }
  
  return longestString || null;
}

// Helper function to search for amount values in preserved columns
function findAmountInPreservedColumns(transaction: Transaction): number {
  // Skip if no preserved columns
  if (!transaction.preservedColumns) return 0;
  
  const preservedColumns = transaction.preservedColumns;
  
  // Keywords that might indicate an amount field
  const amountKeywords = ['amount', 'sum', 'value', 'debit', 'credit', 'money'];
  
  // First try to find columns with amount keywords
  for (const key in preservedColumns) {
    const lowerKey = key.toLowerCase();
    if (amountKeywords.some(keyword => lowerKey.includes(keyword))) {
      const value = preservedColumns[key];
      if (value !== undefined && value !== null) {
        // Try to extract number from string
        const numStr = String(value).replace(/[^0-9.-]+/g, '');
        if (numStr) {
          const num = parseFloat(numStr);
          if (!isNaN(num)) return num;
        }
      }
    }
  }
  
  // If no match found, look for any value that seems like an amount
  for (const key in preservedColumns) {
    const value = preservedColumns[key];
    if (value !== undefined && value !== null) {
      const valueStr = String(value);
      // Look for currency symbols or numeric patterns
      if (/[$€£₦₹¥]/.test(valueStr) || /\d+(\.\d+)?/.test(valueStr)) {
        const numStr = valueStr.replace(/[^0-9.-]+/g, '');
        if (numStr) {
          const num = parseFloat(numStr);
          if (!isNaN(num) && num !== 0) return num;
        }
      }
    }
  }
  
  return 0;
}
