
import { ParsedTransaction } from "./types";
import { parseAmount, parseDate } from "./helpers";

export interface ColumnMapping {
  date: number;
  description: number;
  amount: number;
  type?: number;
}

/**
 * Parse CSV rows using a custom column mapping
 */
export const parseRowsWithMapping = (
  rows: string[][],
  mapping: ColumnMapping,
  hasHeaders: boolean = true
): ParsedTransaction[] => {
  // Skip header row if present
  const dataRows = hasHeaders ? rows.slice(1) : rows;
  
  return dataRows.map((row, index) => {
    // Some statements have a separate column for transaction type
    let transactionType: 'debit' | 'credit' = 'credit';
    let amount = 0;
    
    // Extract and parse amount
    if (mapping.amount >= 0 && row[mapping.amount]) {
      const amountStr = row[mapping.amount];
      amount = Math.abs(parseAmount(amountStr));
      
      // Determine transaction type based on amount
      if (mapping.type !== undefined && mapping.type >= 0) {
        // Use type column if specified
        const typeValue = row[mapping.type]?.toLowerCase() || '';
        transactionType = (
          typeValue.includes('debit') || 
          typeValue.includes('dr') || 
          typeValue === 'd'
        ) ? 'debit' : 'credit';
      } else {
        // Determine type from amount format (negative = debit)
        const rawAmount = parseAmount(amountStr);
        transactionType = rawAmount < 0 ? 'debit' : 'credit';
      }
    }
    
    // Get description, fallback to a default if missing
    const description = mapping.description >= 0 && row[mapping.description] 
      ? row[mapping.description] 
      : `Transaction ${index + 1}`;
    
    // Parse date, fallback to current date if missing
    const dateValue = mapping.date >= 0 && row[mapping.date] 
      ? parseDate(row[mapping.date]) 
      : new Date();
    
    return {
      id: `transaction-${index}-${Date.now()}`,
      date: dateValue,
      description: description.trim(),
      amount,
      type: transactionType,
      selected: transactionType === 'debit', // Select debits by default
      category: undefined
    };
  });
};

/**
 * Extract headers and sample data from raw CSV data
 */
export const extractHeadersAndData = (rows: string[][]) => {
  if (rows.length === 0) {
    return { headers: [], sampleData: [] };
  }
  
  // Try to determine if the first row is a header row
  const firstRow = rows[0];
  const secondRow = rows.length > 1 ? rows[1] : [];
  
  // Check if first row looks like a header
  const hasHeader = firstRow.some(cell => {
    const cellText = (cell || '').toString().toLowerCase();
    return (
      cellText.includes('date') || 
      cellText.includes('desc') || 
      cellText.includes('amount') || 
      cellText.includes('debit') ||
      cellText.includes('credit') ||
      cellText.includes('transaction') ||
      cellText.includes('reference')
    );
  });
  
  return {
    headers: hasHeader ? firstRow : firstRow.map((_, i) => `Column ${i+1}`),
    sampleData: hasHeader ? rows.slice(1) : rows,
    hasHeader
  };
};

/**
 * Attempt to automatically map columns based on common header names
 */
export const guessColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {
    date: -1,
    description: -1,
    amount: -1
  };
  
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase();
    
    if (
      headerLower.includes('date') || 
      headerLower.includes('time') ||
      headerLower === 'dt'
    ) {
      mapping.date = index;
    } 
    else if (
      headerLower.includes('desc') || 
      headerLower.includes('narr') || 
      headerLower.includes('part') || 
      headerLower.includes('ref') ||
      headerLower.includes('transaction')
    ) {
      mapping.description = index;
    } 
    else if (
      headerLower === 'amount' || 
      headerLower === 'sum' || 
      headerLower === 'value' ||
      headerLower === 'amt'
    ) {
      mapping.amount = index;
    }
    else if (
      headerLower.includes('debit') ||
      headerLower.includes('dr') ||
      headerLower === 'payment'
    ) {
      mapping.amount = index;
    }
    else if (
      headerLower.includes('type') || 
      headerLower.includes('dr/cr') || 
      headerLower.includes('d/c')
    ) {
      mapping.type = index;
    }
  });
  
  return mapping;
};
