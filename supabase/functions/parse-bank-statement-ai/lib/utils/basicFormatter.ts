
import { Transaction } from '../types.ts';

/**
 * Apply basic formatting to standardize transaction structure without AI
 * This helps ensure consistency even when AI formatting fails
 */
export function basicFormatting(transactions: Transaction[]): Transaction[] {
  return transactions
    .map(tx => {
      // Skip processing if this appears to be a header or summary row
      if (isHeaderOrSummaryRow(tx)) {
        return null;
      }
      
      // Extract transaction data from various fields
      const { date, description, amount, type } = extractTransactionData(tx);
      
      // Skip if we couldn't extract essential data
      if (!date || !description || amount === null || amount === undefined) {
        return null;
      }
      
      return {
        id: tx.id || `tx-${crypto.randomUUID()}`,
        date: date,
        description: description,
        amount: amount,
        type: type || (amount < 0 ? "debit" : "credit"),
        category: "",
        selected: amount < 0, // Pre-select debits by default
        source: "",
        originalDate: tx.date,
        originalAmount: tx.amount,
        preservedColumns: tx.preservedColumns || {}
      };
    })
    .filter((tx): tx is Transaction => tx !== null);
}

/**
 * Determine if a row appears to be a header or summary row
 */
function isHeaderOrSummaryRow(tx: Transaction): boolean {
  if (!tx.preservedColumns) return false;
  
  const values = Object.values(tx.preservedColumns);
  
  // Check if any preserved column value indicates this is a header/summary row
  for (const value of values) {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes("summary") || 
          lowerValue.includes("balance") ||
          lowerValue.includes("date/time") ||
          lowerValue.includes("money in") && lowerValue.includes("money out") ||
          lowerValue.includes("transaction") && lowerValue.includes("description") ||
          lowerValue === "debit" || 
          lowerValue === "credit") {
        return true;
      }
    }
  }
  
  // Check for patterns that suggest this is not an actual transaction
  if (!tx.description && (!tx.amount || tx.amount === 0)) {
    return true;
  }
  
  return false;
}

/**
 * Extract transaction data from various possible locations in the object
 */
function extractTransactionData(tx: Transaction): { 
  date: string; 
  description: string;
  amount: number;
  type: "debit" | "credit" | undefined;
} {
  let date = tx.date;
  let description = tx.description || "";
  let amount = tx.amount || 0;
  let type = tx.type as "debit" | "credit" | undefined;
  
  // If we have preserved columns, try to extract data from them
  if (tx.preservedColumns) {
    const cols = tx.preservedColumns;
    
    // Look for date in preserved columns
    if (!date) {
      for (const [key, value] of Object.entries(cols)) {
        if (typeof value === 'string' && 
            /\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}/.test(value)) {
          date = formatDate(value);
          break;
        }
      }
    }
    
    // Look for description in preserved columns
    if (!description) {
      for (const [key, value] of Object.entries(cols)) {
        if (typeof value === 'string' && 
            value.length > 5 && 
            !/^\d+(\.\d+)?$/.test(value) &&
            !key.includes("__EMPTY")) {
          description = value;
          break;
        }
      }
    }
    
    // Look for amount in preserved columns
    if (amount === 0) {
      for (const [key, value] of Object.entries(cols)) {
        if (typeof value === 'string') {
          // Look for currency patterns
          const amountMatch = value.match(/[-+]?\s*[₦£$€]?\s*[\d,]+(\.\d+)?/);
          if (amountMatch) {
            const extractedAmount = amountMatch[0]
              .replace(/[₦£$€,\s]/g, '')
              .trim();
            
            if (extractedAmount) {
              amount = parseFloat(extractedAmount);
              
              // If the key or surrounding text suggests this is a debit
              if (key.toLowerCase().includes("debit") || 
                  key.toLowerCase().includes("out") ||
                  value.toLowerCase().includes("debit") ||
                  value.toLowerCase().includes("payment") ||
                  value.toLowerCase().includes("withdrawal")) {
                amount = -Math.abs(amount);
                type = "debit";
              } else if (key.toLowerCase().includes("credit") || 
                         key.toLowerCase().includes("in") ||
                         value.toLowerCase().includes("credit") ||
                         value.toLowerCase().includes("deposit")) {
                amount = Math.abs(amount);
                type = "credit";
              }
              
              break;
            }
          }
        }
      }
    }
  }
  
  // Clean up description
  if (description) {
    description = description
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    description = "Unknown Transaction";
  }
  
  // Ensure date is in ISO format
  if (date && !date.includes("T")) {
    date = formatDate(date);
  }
  
  // Default date if none found
  if (!date) {
    date = new Date().toISOString();
  }
  
  return { date, description, amount, type };
}

/**
 * Convert date string to ISO format
 */
function formatDate(dateStr: string): string {
  try {
    // Try to parse various date formats
    let dateParts: number[] = [];
    
    if (dateStr.includes('/')) {
      dateParts = dateStr.split('/').map(p => parseInt(p));
    } else if (dateStr.includes('-')) {
      dateParts = dateStr.split('-').map(p => parseInt(p));
    } else if (dateStr.includes('.')) {
      dateParts = dateStr.split('.').map(p => parseInt(p));
    }
    
    if (dateParts.length !== 3) {
      return dateStr; // Return original if we can't parse
    }
    
    // Try to determine format (DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD)
    let year, month, day;
    
    if (dateParts[0] > 1000) { // YYYY/MM/DD
      year = dateParts[0];
      month = dateParts[1];
      day = dateParts[2];
    } else if (dateParts[2] > 1000) { // DD/MM/YYYY or MM/DD/YYYY
      year = dateParts[2];
      // Heuristic: if first part > 12, it's likely a day
      if (dateParts[0] > 12) {
        day = dateParts[0];
        month = dateParts[1];
      } else {
        // Default to DD/MM/YYYY for international format
        day = dateParts[0];
        month = dateParts[1];
      }
    } else {
      // Just use current date if format is unrecognized
      return new Date().toISOString().split('T')[0];
    }
    
    // Create ISO date string
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (e) {
    // Return ISO date string for current date on any error
    return new Date().toISOString().split('T')[0];
  }
}
