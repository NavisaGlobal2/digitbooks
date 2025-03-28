
/**
 * Fallback CSV processing when AI processing fails
 */
export async function fallbackCSVProcessing(fileContent: string): Promise<any[]> {
  try {
    console.log("Using fallback CSV processing method...");
    const lines = fileContent.split('\n');
    
    // Skip header row and empty lines
    const dataRows = lines.filter(line => line.trim().length > 0);
    
    if (dataRows.length < 2) {
      throw new Error("Not enough data rows in CSV");
    }
    
    // Try to detect date, description, and amount columns based on common patterns
    const transactions = [];
    
    for (let i = 1; i < dataRows.length; i++) { // Skip header row
      const row = dataRows[i].split(',');
      
      if (row.length < 3) continue; // Skip rows with too few columns
      
      // Simple heuristic - assume first column with date-like format is date
      // column with longest text is description, and column with number-like format is amount
      let dateCol = -1;
      let descCol = -1;
      let amountCol = -1;
      
      // Find potential date column
      for (let j = 0; j < row.length; j++) {
        const cell = row[j].trim();
        if (/\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/.test(cell)) {
          dateCol = j;
          break;
        }
      }
      
      // Find description column (longest text)
      let maxLength = 0;
      for (let j = 0; j < row.length; j++) {
        if (j !== dateCol) {
          const cell = row[j].trim();
          if (cell.length > maxLength && !cell.match(/^[-+]?\d+(\.\d+)?$/)) {
            maxLength = cell.length;
            descCol = j;
          }
        }
      }
      
      // Find amount column
      for (let j = 0; j < row.length; j++) {
        if (j !== dateCol && j !== descCol) {
          const cell = row[j].trim().replace(/[,$]/g, '');
          if (cell.match(/^[-+]?\d+(\.\d+)?$/)) {
            amountCol = j;
            break;
          }
        }
      }
      
      // If we found all columns, extract transaction
      if (dateCol !== -1 && descCol !== -1 && amountCol !== -1) {
        const amount = parseFloat(row[amountCol].trim().replace(/[,$]/g, ''));
        transactions.push({
          date: formatDate(row[dateCol].trim()),
          description: row[descCol].trim(),
          amount: amount,
          type: amount < 0 ? "debit" : "credit"
        });
      }
    }
    
    console.log(`Fallback processing extracted ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error("Error in fallback CSV processing:", error);
    return []; // Return empty array if fallback fails
  }
}

/**
 * Helper to standardize date format
 */
function formatDate(dateStr: string): string {
  try {
    // Try to parse the date string in various formats
    let dateParts: number[] = [];
    
    if (dateStr.includes('/')) {
      dateParts = dateStr.split('/').map(p => parseInt(p));
    } else if (dateStr.includes('-')) {
      dateParts = dateStr.split('-').map(p => parseInt(p));
    } else if (dateStr.includes('.')) {
      dateParts = dateStr.split('.').map(p => parseInt(p));
    }
    
    if (dateParts.length !== 3) {
      return dateStr; // Return original if we can't parse
    }
    
    // Determine if format is MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
    let year, month, day;
    
    if (dateParts[0] > 1000) { // YYYY/MM/DD
      year = dateParts[0];
      month = dateParts[1];
      day = dateParts[2];
    } else if (dateParts[2] > 1000) { // MM/DD/YYYY or DD/MM/YYYY
      year = dateParts[2];
      // Heuristic: if first part > 12, it's likely a day
      if (dateParts[0] > 12) {
        day = dateParts[0];
        month = dateParts[1];
      } else {
        // Default to MM/DD/YYYY
        month = dateParts[0];
        day = dateParts[1];
      }
    } else {
      // Just use original string if we can't determine format
      return dateStr;
    }
    
    // Pad month and day with leading zeros if needed
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}`;
  } catch (e) {
    return dateStr; // Return original on any error
  }
}
