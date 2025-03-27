
// Parse amount from various formats
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
    
    // Support formats with "DR" or "CR" suffixes
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
    // YYYY/MM/DD
    { regex: /(\d{4})\/(\d{1,2})\/(\d{1,2})/, fn: (m: RegExpMatchArray) => new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`) },
    // YYYY-MM-DD
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, fn: (m: RegExpMatchArray) => new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`) },
    // DD MMM YYYY (e.g. 01 Jan 2023)
    { regex: /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${getMonthNumber(m[2])}-${m[1].padStart(2, '0')}`) },
    // MMM DD, YYYY (e.g. Jan 01, 2023)
    { regex: /([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/, fn: (m: RegExpMatchArray) => new Date(`${m[3]}-${getMonthNumber(m[1])}-${m[2].padStart(2, '0')}`) },
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      const parsedDate = format.fn(match);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
  }
  
  // Try to handle date formats with time components
  const dateTimeMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s+(\d{1,2}):(\d{1,2})/);
  if (dateTimeMatch) {
    // Try both MM/DD and DD/MM interpretations
    const date1 = new Date(`${dateTimeMatch[3]}-${dateTimeMatch[1].padStart(2, '0')}-${dateTimeMatch[2].padStart(2, '0')}T${dateTimeMatch[4].padStart(2, '0')}:${dateTimeMatch[5].padStart(2, '0')}:00`);
    if (!isNaN(date1.getTime())) return date1;
    
    const date2 = new Date(`${dateTimeMatch[3]}-${dateTimeMatch[2].padStart(2, '0')}-${dateTimeMatch[1].padStart(2, '0')}T${dateTimeMatch[4].padStart(2, '0')}:${dateTimeMatch[5].padStart(2, '0')}:00`);
    if (!isNaN(date2.getTime())) return date2;
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

// Helper function to convert month name to month number
function getMonthNumber(monthStr: string): string {
  const months: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  
  return months[monthStr.toLowerCase().slice(0, 3)] || '01';
}
