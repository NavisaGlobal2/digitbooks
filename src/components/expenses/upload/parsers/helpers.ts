
/**
 * Helper functions for parsing dates and amounts from various formats
 */

// Parse a date string into a Date object
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();

  // Try to parse the date string directly
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Handle different date formats
  const formats = [
    // DD/MM/YYYY or DD-MM-YYYY
    {
      regex: /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/,
      parse: (match: RegExpMatchArray) => {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Months are 0-indexed in JS
        let year = parseInt(match[3], 10);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        return new Date(year, month, day);
      }
    },
    // MM/DD/YYYY or MM-DD-YYYY (US format)
    {
      regex: /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
      parse: (match: RegExpMatchArray) => {
        const month = parseInt(match[1], 10) - 1; // Months are 0-indexed in JS
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        return new Date(year, month, day);
      }
    },
    // YYYY/MM/DD or YYYY-MM-DD (ISO format)
    {
      regex: /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
      parse: (match: RegExpMatchArray) => {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Months are 0-indexed in JS
        const day = parseInt(match[3], 10);
        
        return new Date(year, month, day);
      }
    }
  ];
  
  // Try each format
  for (const format of formats) {
    const match = dateString.match(format.regex);
    if (match) {
      const parsedDate = format.parse(match);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }
  
  // If all parsing attempts fail, return current date
  console.warn(`Could not parse date: ${dateString}, using current date instead`);
  return new Date();
};

// Parse an amount string into a number
export const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;
  
  // Remove currency symbols, commas, and other non-numeric characters except for decimal points and minus signs
  const cleanedStr = amountStr.replace(/[^\d.-]/g, '');
  
  // If there's nothing left after cleaning, return 0
  if (!cleanedStr) return 0;
  
  // Parse the cleaned string as a float
  const amount = parseFloat(cleanedStr);
  
  // Check if the result is a valid number
  return isNaN(amount) ? 0 : amount;
};
