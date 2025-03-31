
import { RevenueSource } from "@/types/revenue";

/**
 * Helper function to extract date from transaction
 */
export function extractDate(tx: any): Date {
  try {
    // First try to use the AI-formatted date if available
    if (tx.date) {
      const parsedDate = new Date(tx.date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    if (tx.preservedColumns) {
      // Try to find date fields in preserved columns
      const possibleDateFields = [
        "STATEMENT OF ACCOUNT",
        "Date",
        "Transaction Date",
        "VALUE DATE",
        "POSTING DATE"
      ];
      
      for (const field of possibleDateFields) {
        if (tx.preservedColumns[field]) {
          const dateStr = tx.preservedColumns[field];
          
          // Handle date formats like "12-Aug-2024"
          if (dateStr && /\d{1,2}-[A-Za-z]{3}-\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap: {[key: string]: number} = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day));
          }
          
          // Try standard date parsing
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  // Default to current date if no valid date found
  return new Date();
}

/**
 * Helper function to extract description from transaction
 */
export function extractDescription(tx: any): string {
  // First try to use the AI-formatted description if available
  if (tx.description) {
    return tx.description;
  }
  
  if (tx.preservedColumns) {
    // Try common description fields
    const possibleDescFields = [
      "NARRATION", 
      "Description", 
      "PARTICULARS", 
      "__EMPTY", 
      "Remarks", 
      "Transaction Description"
    ];
    
    for (const field of possibleDescFields) {
      if (tx.preservedColumns[field] && typeof tx.preservedColumns[field] === 'string') {
        return tx.preservedColumns[field].trim();
      }
    }
  }
  
  return "Unknown transaction";
}

/**
 * Helper function to extract credit amount from transaction
 */
export function extractCreditAmount(tx: any): number {
  // First check if we already have a processed amount from AI formatting
  if (tx.amount && tx.type === 'credit') {
    return parseFloat(tx.amount);
  }
  
  if (tx.preservedColumns) {
    // Try common credit amount fields
    const possibleCreditFields = [
      "CREDIT", 
      "__EMPTY_3", 
      "Credit Amount",
      "CREDIT AMOUNT", 
      "INFLOW"
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
 * Helper function to extract amount (handles both credit and debit)
 */
export function extractAmount(tx: any): number {
  // First try to use the AI-formatted amount if available
  if (typeof tx.amount === 'number') {
    return Math.abs(tx.amount); // Convert negative to positive for revenue
  }
  
  const creditAmount = extractCreditAmount(tx);
  if (creditAmount > 0) {
    return creditAmount;
  }
  
  return 0;
}
