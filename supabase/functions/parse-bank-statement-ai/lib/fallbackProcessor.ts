
import { sanitizeTextForAPI, cleanCurrencyValue, formatDate } from "./utils.ts";

/**
 * Process CSV text with a fallback method when AI processing fails
 * @param fileText The CSV text content
 * @returns Array of transactions
 */
export async function fallbackCSVProcessing(fileText: string): Promise<any[]> {
  console.log("Starting fallback CSV processing");
  
  try {
    const lines = fileText.split(/\r\n|\n/);
    const transactions: any[] = [];
    
    // Assume first row might be headers
    if (lines.length < 2) {
      console.log("CSV has too few lines for fallback processing");
      return [];
    }
    
    // Try to identify headers
    const potentialHeaders = lines[0].toLowerCase();
    console.log(`Potential headers: ${potentialHeaders}`);
    
    // Check if it looks like a header row
    const hasHeaders = /date|description|amount|debit|credit|balance|transaction/.test(potentialHeaders);
    
    // Start processing from row 1 if headers detected, otherwise start at row 0
    const startRow = hasHeaders ? 1 : 0;
    
    // Try to determine column positions
    const columnMap = determineColumns(lines[0].toLowerCase().split(/[,\t]/));
    console.log("Column mapping:", columnMap);
    
    // If we couldn't identify critical columns, try another approach
    if (!columnMap.dateCol && !columnMap.amountCol && !columnMap.descCol) {
      console.log("Could not identify columns, trying pattern-based extraction");
      return extractTransactionsFromText(fileText);
    }
    
    // Process each data row
    for (let i = startRow; i < lines.length; i++) {
      // Skip empty lines
      if (!lines[i].trim()) continue;
      
      // Split the line by delimiter (comma or tab)
      const delimiter = lines[i].includes('\t') ? '\t' : ',';
      const cells = lines[i].split(delimiter);
      
      // Ensure we have enough cells
      if (cells.length < 2) continue;
      
      // Extract data based on identified columns
      let date = '';
      let description = '';
      let amount = 0;
      let type = 'unknown';
      
      // Get date
      if (columnMap.dateCol !== undefined && columnMap.dateCol < cells.length) {
        date = formatDate(cells[columnMap.dateCol].trim());
      } else {
        // Try to find a date in any cell
        for (const cell of cells) {
          if (/\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}/.test(cell)) {
            date = formatDate(cell.trim());
            break;
          }
        }
      }
      
      // Get description
      if (columnMap.descCol !== undefined && columnMap.descCol < cells.length) {
        description = cells[columnMap.descCol].trim();
      } else {
        // Use the longest text cell as description
        let longestText = '';
        for (const cell of cells) {
          if (cell.length > longestText.length && !/^\d+[.,]?\d*$/.test(cell)) {
            longestText = cell.trim();
          }
        }
        description = longestText;
      }
      
      // Get amount and type
      if (columnMap.debitCol !== undefined && columnMap.debitCol < cells.length) {
        const debitValue = cells[columnMap.debitCol].trim();
        if (debitValue && debitValue !== '0' && debitValue !== '0.00') {
          amount = cleanCurrencyValue(debitValue);
          type = 'debit';
        }
      }
      
      if (columnMap.creditCol !== undefined && columnMap.creditCol < cells.length) {
        const creditValue = cells[columnMap.creditCol].trim();
        if (creditValue && creditValue !== '0' && creditValue !== '0.00') {
          amount = cleanCurrencyValue(creditValue);
          type = 'credit';
        }
      }
      
      // If we have a single amount column
      if (columnMap.amountCol !== undefined && columnMap.amountCol < cells.length && type === 'unknown') {
        const rawAmount = cells[columnMap.amountCol].trim();
        amount = cleanCurrencyValue(rawAmount);
        
        // Determine type based on amount sign or description keywords
        if (amount < 0) {
          amount = Math.abs(amount);
          type = 'debit';
        } else if (amount > 0) {
          type = 'credit';
        } else {
          // Determine type from description if amount is 0 or not clear
          const descLower = description.toLowerCase();
          if (/payment|withdraw|debit|purchase|fee|charge/i.test(descLower)) {
            type = 'debit';
          } else if (/deposit|credit|receive|interest|transfer to/i.test(descLower)) {
            type = 'credit';
          } else {
            type = 'unknown';
          }
        }
      }
      
      // If we have valid data, add the transaction
      if (date && description && amount !== 0) {
        // Format amount sign according to type (negative for debits)
        const finalAmount = type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
        
        transactions.push({
          date,
          description,
          amount: finalAmount,
          type
        });
      }
    }
    
    console.log(`Extracted ${transactions.length} transactions via fallback CSV processor`);
    return transactions;
  } catch (error) {
    console.error("Error in fallback CSV processing:", error);
    return [];
  }
}

/**
 * Determine column positions in CSV data
 * @param headers Array of header cells
 * @returns Object with column indices
 */
function determineColumns(headers: string[]): { 
  dateCol?: number; 
  descCol?: number; 
  amountCol?: number;
  debitCol?: number;
  creditCol?: number;
} {
  const result: { 
    dateCol?: number; 
    descCol?: number; 
    amountCol?: number;
    debitCol?: number;
    creditCol?: number;
  } = {};
  
  // Look for common header names
  headers.forEach((header, index) => {
    const h = header.trim().toLowerCase();
    
    // Date column
    if (/^date$|^date\s|transaction date|date of transaction|^time$/.test(h)) {
      result.dateCol = index;
    }
    
    // Description column
    if (/description|narrative|particulars|details|^name$|merchant|payee/.test(h)) {
      result.descCol = index;
    }
    
    // Amount column (single column for both debits and credits)
    if (/^amount$|^amount\s|transaction amount|sum|value/.test(h)) {
      result.amountCol = index;
    }
    
    // Debit column
    if (/debit|payment|withdrawal|sent|expense|out|paid|dr\.?$/.test(h)) {
      result.debitCol = index;
    }
    
    // Credit column
    if (/credit|deposit|received|incoming|in|cr\.?$/.test(h)) {
      result.creditCol = index;
    }
  });
  
  return result;
}

/**
 * Extract transactions by looking for patterns in the raw text
 * @param text Raw text content
 * @returns Array of transactions
 */
function extractTransactionsFromText(text: string): any[] {
  console.log("Attempting pattern-based transaction extraction");
  const transactions: any[] = [];
  
  // Look for date patterns followed by description and amount
  const lines = text.split(/\r\n|\n/);
  
  for (const line of lines) {
    // Skip likely header rows
    if (/date|description|amount|debit|credit|balance|transaction/i.test(line)) {
      continue;
    }
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Look for date pattern
    const dateMatch = line.match(/\b(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})\b/);
    if (!dateMatch) continue;
    
    // Extract potential date
    const date = formatDate(dateMatch[0]);
    
    // Assume rest of line after date contains description and amount
    const afterDate = line.substring(line.indexOf(dateMatch[0]) + dateMatch[0].length);
    
    // Look for amount pattern (numbers with decimal point, possibly with currency symbol)
    const amountMatches = afterDate.match(/[$€£¥]?\s?\d+[.,]\d{2}\b|\b\d+[.,]\d{2}\s?[$€£¥]?/g);
    if (!amountMatches || amountMatches.length === 0) continue;
    
    // Use the last number as the amount
    const amountStr = amountMatches[amountMatches.length - 1];
    const amount = cleanCurrencyValue(amountStr);
    
    // Extract description (text between date and amount)
    let description = afterDate;
    if (amountMatches.length > 0) {
      description = afterDate.substring(0, afterDate.lastIndexOf(amountMatches[amountMatches.length - 1]));
    }
    description = description.trim();
    
    // Determine transaction type
    let type = 'unknown';
    if (/payment|withdraw|debit|purchase|fee|charge/i.test(description)) {
      type = 'debit';
    } else if (/deposit|credit|receive|interest|transfer to/i.test(description)) {
      type = 'credit';
    }
    
    // Format amount sign according to type (negative for debits)
    const finalAmount = type === 'debit' ? -Math.abs(amount) : Math.abs(amount);
    
    transactions.push({
      date,
      description,
      amount: finalAmount,
      type
    });
  }
  
  console.log(`Extracted ${transactions.length} transactions via pattern matching`);
  return transactions;
}
