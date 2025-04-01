
/**
 * Format utilities for extracted transactions
 */

// Extract date from transaction object, handling various date formats
export function extractDate(transaction: any): string {
  if (!transaction) return new Date().toISOString();
  
  // Try to find date in likely fields
  const dateFields = ['date', 'transaction_date', 'txn_date', 'valueDate', 'postDate'];
  let dateValue = null;
  
  // Check preserved columns first if they exist
  if (transaction.preservedColumns) {
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('date')) {
        dateValue = transaction.preservedColumns[key];
        if (dateValue) break;
      }
    }
  }
  
  // If no date found in preserved columns, check top-level fields
  if (!dateValue) {
    for (const field of dateFields) {
      if (transaction[field]) {
        dateValue = transaction[field];
        break;
      }
    }
  }
  
  // If still no date, use original date if it exists
  if (!dateValue && transaction.originalDate) {
    dateValue = transaction.originalDate;
  }
  
  // As last resort, use current date
  if (!dateValue) {
    return new Date().toISOString();
  }
  
  // Try to parse the date
  try {
    // If it's already a Date object or ISO string
    if (dateValue instanceof Date || (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/))) {
      return new Date(dateValue).toISOString();
    }
    
    // Handle DD/MM/YYYY format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/)) {
      const parts = dateValue.split(/[/-]/);
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day).toISOString();
    }
    
    // Handle MM/DD/YYYY format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/)) {
      return new Date(dateValue).toISOString();
    }
    
    // Last resort parsing
    return new Date(dateValue).toISOString();
  } catch (e) {
    console.warn("Could not parse date:", dateValue);
    return new Date().toISOString();
  }
}

// Extract description from transaction object
export function extractDescription(transaction: any): string {
  if (!transaction) return "Unknown Transaction";
  
  // Check preserved columns first for narrative/description fields
  if (transaction.preservedColumns) {
    const descFields = [
      'description', 'narrative', 'details', 'remarks', 
      'particulars', 'memo', 'reference', 'note'
    ];
    
    for (const field of descFields) {
      for (const key of Object.keys(transaction.preservedColumns)) {
        if (key.toLowerCase().includes(field)) {
          const value = transaction.preservedColumns[key];
          if (value && typeof value === 'string' && value.trim() !== '') {
            return value;
          }
        }
      }
    }
  }
  
  // Check direct fields
  const directFields = [
    'description', 'narrative', 'details', 'remarks', 
    'particulars', 'memo', 'reference', 'note'
  ];
  
  for (const field of directFields) {
    if (transaction[field] && typeof transaction[field] === 'string' && transaction[field].trim() !== '') {
      return transaction[field];
    }
  }
  
  // Use originalDescription if present
  if (transaction.originalDescription && typeof transaction.originalDescription === 'string' && 
      transaction.originalDescription.trim() !== '') {
    return transaction.originalDescription;
  }
  
  // Default
  return "Unknown Transaction";
}

// Extract amount from transaction object
export function extractAmount(transaction: any): number {
  if (!transaction) return 0;
  
  // If type is credit and amount is positive, return as is
  if (transaction.type === 'credit' && typeof transaction.amount === 'number' && transaction.amount > 0) {
    return transaction.amount;
  }
  
  // If type is debit and amount is negative, return as is
  if (transaction.type === 'debit' && typeof transaction.amount === 'number' && transaction.amount < 0) {
    return transaction.amount;
  }
  
  // Check preserved columns for credit amount
  if (transaction.preservedColumns) {
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('credit')) {
        const value = transaction.preservedColumns[key];
        if (value) {
          const amount = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
          if (!isNaN(amount) && amount > 0) {
            return amount;
          }
        }
      }
    }
    
    // Check for debit amount
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('debit')) {
        const value = transaction.preservedColumns[key];
        if (value) {
          const amount = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
          if (!isNaN(amount) && amount > 0) {
            return -amount; // Negate debit amounts
          }
        }
      }
    }
    
    // Check for general amount
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('amount')) {
        const value = transaction.preservedColumns[key];
        if (value) {
          const amount = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
          if (!isNaN(amount)) {
            return amount;
          }
        }
      }
    }
  }
  
  // Check original amount if present
  if (transaction.originalAmount) {
    const amount = parseFloat(String(transaction.originalAmount).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(amount)) {
      return amount;
    }
  }
  
  // Use the amount property if present
  if (transaction.amount !== undefined) {
    if (typeof transaction.amount === 'number') {
      return transaction.amount;
    }
    if (typeof transaction.amount === 'string') {
      const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ''));
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  
  // Default
  return 0;
}

// Determine transaction type (debit or credit)
export function determineTransactionType(transaction: any): "credit" | "debit" | "unknown" {
  if (!transaction) return "unknown";
  
  // Check explicit type
  if (transaction.type) {
    const typeStr = String(transaction.type).toLowerCase();
    if (typeStr.includes('credit') || typeStr.includes('deposit') || typeStr.includes('income')) {
      return "credit";
    }
    if (typeStr.includes('debit') || typeStr.includes('withdrawal') || typeStr.includes('expense')) {
      return "debit";
    }
  }
  
  // Check preserved columns
  if (transaction.preservedColumns) {
    // If credit column has value
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('credit')) {
        const value = transaction.preservedColumns[key];
        if (value && String(value).trim() !== '') {
          return "credit";
        }
      }
    }
    
    // If debit column has value
    for (const key of Object.keys(transaction.preservedColumns)) {
      if (key.toLowerCase().includes('debit')) {
        const value = transaction.preservedColumns[key];
        if (value && String(value).trim() !== '') {
          return "debit";
        }
      }
    }
  }
  
  // Check by amount sign
  const amount = extractAmount(transaction);
  if (amount > 0) {
    return "credit";
  } else if (amount < 0) {
    return "debit";
  }
  
  return "unknown";
}

// Helper for credit amounts
export function extractCreditAmount(transaction: any): number {
  if (determineTransactionType(transaction) === "credit") {
    return Math.abs(extractAmount(transaction));
  }
  return 0;
}

// Helper for debit amounts
export function extractDebitAmount(transaction: any): number {
  if (determineTransactionType(transaction) === "debit") {
    return Math.abs(extractAmount(transaction));
  }
  return 0;
}
