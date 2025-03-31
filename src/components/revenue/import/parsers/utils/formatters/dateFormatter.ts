
/**
 * Helper functions for extracting and formatting dates from transactions
 */

/**
 * Helper function to extract date from transaction
 */
export function extractDate(tx: any): Date {
  try {
    // First try to use the AI-formatted date if available
    if (tx.date) {
      const parsedDate = new Date(tx.date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    if (tx.preservedColumns) {
      // Try to find date fields in preserved columns
      const possibleDateFields = [
        "STATEMENT OF ACCOUNT",
        "Date",
        "Transaction Date",
        "VALUE DATE",
        "POSTING DATE",
        "Date/Time",
        "TransactionDate",
        "Value Date"
      ];
      
      for (const field of possibleDateFields) {
        if (tx.preservedColumns[field]) {
          const dateStr = tx.preservedColumns[field];
          
          // Handle various date formats
          
          // Handle date formats like "12-Aug-2024"
          if (dateStr && /\d{1,2}-[A-Za-z]{3}-\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap: {[key: string]: number} = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day));
          }
          
          // Handle date formats like "dd/mm/yyyy"
          if (dateStr && /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(dateStr)) {
            const parts = dateStr.split('/');
            // Assuming day/month/year format (common in many countries)
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
              let year = parseInt(parts[2]);
              
              // Handle 2-digit years
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
          }
          
          // Try standard date parsing
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  // Default to current date if no valid date found
  return new Date();
}
