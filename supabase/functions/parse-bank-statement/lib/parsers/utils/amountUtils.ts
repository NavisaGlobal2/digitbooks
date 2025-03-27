
// Amount-related utility functions for parsing bank statements

/**
 * Parse amount from various formats
 */
export function parseAmount(value: any): number {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Skip empty strings
    if (!value.trim()) return 0;
    
    // Remove currency symbols and commas, including Naira symbol (₦)
    const cleaned = value.replace(/[,$€£₦\s]/g, '');
    
    // Support formats with parentheses indicating negative numbers: (100.00)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1));
    }
    
    // Support dash or minus prefix for negative numbers
    if (cleaned.startsWith('-')) {
      return parseFloat(cleaned);
    }
    
    // Support formats with "DR" or "CR" suffixes - common in Nigerian bank statements
    if (cleaned.toUpperCase().endsWith('DR')) {
      return -parseFloat(cleaned.slice(0, -2));
    }
    
    if (cleaned.toUpperCase().endsWith('CR')) {
      return parseFloat(cleaned.slice(0, -2));
    }
    
    // Regular positive number
    return parseFloat(cleaned) || 0;
  }
  
  return 0;
}
