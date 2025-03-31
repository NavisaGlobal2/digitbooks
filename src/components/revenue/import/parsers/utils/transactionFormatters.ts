
import { RevenueSource } from "@/types/revenue";
import { ExpenseCategory } from "@/types/expense";

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
        "POSTING DATE",
        "Date/Time",
        "TransactionDate",
        "Value Date"
      ];
      
      for (const field of possibleDateFields) {
        if (tx.preservedColumns[field]) {
          const dateStr = tx.preservedColumns[field];
          
          // Handle various date formats
          
          // Handle date formats like "12-Aug-2024"
          if (dateStr && /\d{1,2}-[A-Za-z]{3}-\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap: {[key: string]: number} = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day));
          }
          
          // Handle date formats like "dd/mm/yyyy"
          if (dateStr && /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(dateStr)) {
            const parts = dateStr.split('/');
            // Assuming day/month/year format (common in many countries)
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
              let year = parseInt(parts[2]);
              
              // Handle 2-digit years
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
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
  if (tx.description && typeof tx.description === 'string' && tx.description.trim()) {
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
      "Transaction Description",
      "Narrative",
      "Details",
      "Reference",
      "To / From"
    ];
    
    for (const field of possibleDescFields) {
      if (tx.preservedColumns[field] && typeof tx.preservedColumns[field] === 'string') {
        return tx.preservedColumns[field].trim();
      }
    }
    
    // Try to combine fields if there's no single description field
    let combinedDesc = "";
    
    // Often transaction descriptions are split across multiple fields
    if (tx.preservedColumns["To / From"] && typeof tx.preservedColumns["To / From"] === 'string') {
      combinedDesc += tx.preservedColumns["To / From"].trim() + " - ";
    }
    
    if (tx.preservedColumns["Category"] && typeof tx.preservedColumns["Category"] === 'string') {
      combinedDesc += tx.preservedColumns["Category"].trim();
    }
    
    if (combinedDesc) {
      return combinedDesc;
    }
  }
  
  return "Unknown transaction";
}

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
 * Helper function to determine transaction type (credit or debit)
 */
export function determineTransactionType(tx: any): 'credit' | 'debit' {
  // First check if AI has already determined the type
  if (tx.type === 'credit' || tx.type === 'debit') {
    return tx.type;
  }
  
  // Check for specific type indicators in preserved columns
  if (tx.preservedColumns) {
    const descriptionLower = extractDescription(tx).toLowerCase();
    
    // Look for type indicators in the description
    if (
      descriptionLower.includes('credit') || 
      descriptionLower.includes('deposit') || 
      descriptionLower.includes('inward') || 
      descriptionLower.includes('received')
    ) {
      return 'credit';
    }
    
    if (
      descriptionLower.includes('debit') || 
      descriptionLower.includes('payment') || 
      descriptionLower.includes('withdrawal') || 
      descriptionLower.includes('outward') ||
      descriptionLower.includes('purchase')
    ) {
      return 'debit';
    }
    
    // Check for amount indicators
    const creditAmount = extractCreditAmount(tx);
    const debitAmount = extractDebitAmount(tx);
    
    if (creditAmount > 0 && debitAmount === 0) {
      return 'credit';
    }
    
    if (debitAmount > 0 && creditAmount === 0) {
      return 'debit';
    }
  }
  
  // If amount is negative, it's likely a debit
  if (tx.amount && parseFloat(tx.amount) < 0) {
    return 'debit';
  }
  
  // Default to debit if we can't determine
  return 'debit';
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
