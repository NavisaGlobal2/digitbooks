
// Helper function to parse Excel dates
export function parseExcelDate(dateValue: any, XLSX?: any): Date | null {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a number, it might be an Excel date (days since 1900-01-01)
  if (typeof dateValue === 'number') {
    // Excel date calculation
    const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date;
  }
  
  // If it's a string, try parsing it
  if (typeof dateValue === 'string') {
    // Try parsing with various formats
    const formats = [
      // Direct parsing
      (v: string) => new Date(v),
      
      // MM/DD/YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return match ? new Date(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`) : null;
      },
      
      // DD/MM/YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // MM-DD-YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        return match ? new Date(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`) : null;
      },
      
      // DD-MM-YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // DD.MM.YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // Text month formats: 01 Jan 2022
      (v: string) => {
        const match = v.match(/(\d{1,2})[\s-]([A-Za-z]{3,})[\s-](\d{2,4})/);
        if (!match) return null;
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(match[2].toLowerCase().substring(0, 3)) + 1;
        if (month === 0) return null;
        return new Date(`${match[3].length === 2 ? '20' + match[3] : match[3]}-${month.toString().padStart(2, '0')}-${match[1].padStart(2, '0')}`);
      },
      
      // Text month formats: Jan 01 2022
      (v: string) => {
        const match = v.match(/([A-Za-z]{3,})[\s-](\d{1,2})[\s-](\d{2,4})/);
        if (!match) return null;
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(match[1].toLowerCase().substring(0, 3)) + 1;
        if (month === 0) return null;
        return new Date(`${match[3].length === 2 ? '20' + match[3] : match[3]}-${month.toString().padStart(2, '0')}-${match[2].padStart(2, '0')}`);
      }
    ];
    
    for (const format of formats) {
      try {
        const date = format(dateValue);
        if (date && !isNaN(date.getTime())) return date;
      } catch (e) {
        // Try next format
      }
    }
  }
  
  // If using XLSX, try getting the date from the XLSX library
  if (XLSX && typeof XLSX.SSF !== 'undefined') {
    try {
      // This is an advanced method using the XLSX library if available
      const excelDate = XLSX.SSF.parse_date_code(dateValue);
      if (excelDate) {
        const date = new Date(
          excelDate.y, 
          excelDate.m - 1, 
          excelDate.d, 
          excelDate.H || 0, 
          excelDate.M || 0, 
          excelDate.S || 0
        );
        if (!isNaN(date.getTime())) return date;
      }
    } catch (e) {
      // Fall through to return null
    }
  }
  
  return null;
}

// Helper function to parse amount values
export function parseAmount(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  
  // Handle number type directly
  if (typeof value === 'number') return value;
  
  // Convert to string for processing
  const strValue = String(value);
  
  // Check if amount has parentheses which often indicates negative numbers: (100.00)
  const isNegative = strValue.includes('(') && strValue.includes(')');
  
  // Remove currency symbols, commas, spaces, and parentheses
  let cleaned = strValue.replace(/[₦$€£,\s\(\)]/g, '');
  
  // Handle explicit negative sign
  const hasNegativeSign = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');
  
  // Parse the numeric value
  const amount = parseFloat(cleaned);
  
  // Apply negative sign if needed
  if (isNaN(amount)) return 0;
  if (isNegative || hasNegativeSign) return -Math.abs(amount);
  return amount;
}

// Parse amount and determine type (debit/credit)
export function parseAmountWithType(value: any): { amount: number, type: 'debit' | 'credit' } {
  if (value === null || value === undefined || value === '') {
    return { amount: 0, type: 'debit' };
  }
  
  // Handle number type directly
  if (typeof value === 'number') {
    return { 
      amount: Math.abs(value), 
      type: value < 0 ? 'debit' : 'credit' 
    };
  }
  
  // Convert to string for processing
  const strValue = String(value);
  
  // Check for patterns that indicate negative amount (debit)
  const isNegative = 
    strValue.includes('(') && strValue.includes(')') || // Parentheses: (100.00)
    strValue.startsWith('-') || // Leading minus: -100.00
    strValue.includes('DR') || strValue.includes('Dr') || strValue.includes('dr'); // DR indicator
  
  // Remove currency symbols, commas, parentheses, and spaces
  let cleaned = strValue.replace(/[₦$€£,\s\(\)]/g, '');
  
  // Remove DR/CR indicators for parsing
  cleaned = cleaned.replace(/\b(DR|Dr|dr|CR|Cr|cr)\b/g, '');
  
  // Handle explicit negative sign
  cleaned = cleaned.replace(/-/g, '');
  
  // Parse the numeric value
  const amount = parseFloat(cleaned);
  
  if (isNaN(amount)) return { amount: 0, type: 'debit' };
  
  // Determine type based on indicators or sign
  let type: 'debit' | 'credit' = 'credit';
  
  if (isNegative || 
      strValue.includes('DR') || strValue.includes('Dr') || strValue.includes('dr') ||
      strValue.includes('DEBIT') || strValue.includes('Debit') || strValue.includes('debit')) {
    type = 'debit';
  } else if (strValue.includes('CR') || strValue.includes('Cr') || strValue.includes('cr') ||
             strValue.includes('CREDIT') || strValue.includes('Credit') || strValue.includes('credit')) {
    type = 'credit';
  }
  
  return { amount: Math.abs(amount), type };
}
