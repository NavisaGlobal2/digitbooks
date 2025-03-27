
// Type detection utility functions

/**
 * Check if a value looks like a date
 */
export function isDateLike(value: any): boolean {
  if (value === null || value === undefined) return false;
  
  // Check for numbers that could be Excel dates
  if (typeof value === 'number' && value > 30000 && value < 50000) return true;
  
  // Check if it's already a Date
  if (value instanceof Date) return true;
  
  // Check for date strings
  if (typeof value === 'string') {
    // Date patterns: yyyy-mm-dd, mm/dd/yyyy, etc.
    if (/\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}/.test(value)) return true;
    
    // Try Date.parse
    if (!isNaN(Date.parse(value))) return true;
  }
  
  return false;
}

/**
 * Check if a value looks like a number
 */
export function looksLikeNumber(value: string): boolean {
  if (!value) return false;
  
  // Remove currency symbols, commas, parentheses
  const cleaned = value.replace(/[$€£₦,\(\)]/g, '').trim();
  
  // Check if it's a number
  return !isNaN(parseFloat(cleaned));
}
