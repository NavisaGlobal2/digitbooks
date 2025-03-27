
// Parse amount from various formats
export function parseAmount(value: any): number {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
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
    
    // Regular positive number
    return parseFloat(cleaned) || 0;
  }
  
  return 0;
}

// Format date to a standard format
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// More flexible date parsing with support for multiple formats
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Clean the string
  dateStr = dateStr.toString().trim().replace(/"|'/g, '');
  
  // Try direct parsing first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try common formats
  const formats = [
    // MM/DD/YYYY
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`) },
    // DD/MM/YYYY
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
    // MM-DD-YYYY
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`) },
    // DD-MM-YYYY
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
    // DD.MM.YYYY
    { regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      const parsedDate = format.fn(match);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
  }
  
  // If it's a number, try parsing as an Excel date (days since 1900-01-01)
  if (!isNaN(Number(dateStr))) {
    const excelDate = Number(dateStr);
    const excelEpoch = new Date(1900, 0, 1);
    const excelDateObj = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
    
    if (!isNaN(excelDateObj.getTime())) {
      return excelDateObj;
    }
  }
  
  // If all fails, return null
  return null;
}

