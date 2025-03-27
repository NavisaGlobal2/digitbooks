
// Parse amount from various formats
export function parseAmount(value: any): number {
  if (typeof value === 'number') return value
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas, including Naira symbol (₦)
    const cleaned = value.replace(/[,$€£₦\s]/g, '')
    
    // Support formats with parentheses indicating negative numbers: (100.00)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1))
    }
    
    return parseFloat(cleaned) || 0
  }
  
  return 0
}
