
/**
 * Helper functions for determining transaction types
 */

import { extractDescription } from './descriptionFormatter';

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
    // Avoiding circular dependency by checking preservedColumns directly
    if (tx.preservedColumns["CREDIT"] || tx.preservedColumns["Credit Amount"] || tx.preservedColumns["INFLOW"]) {
      return 'credit';
    }
    
    if (tx.preservedColumns["DEBIT"] || tx.preservedColumns["Debit Amount"] || tx.preservedColumns["OUTFLOW"]) {
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
