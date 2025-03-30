
import { sanitizeTextForAPI } from './utils.ts';
import { parse as parseCSV } from "https://deno.land/std@0.170.0/encoding/csv.ts";

/**
 * Simple fallback CSV processor that attempts to identify transaction data
 * when AI services are unavailable
 */
export async function fallbackCSVProcessing(csvContent: string): Promise<any[]> {
  console.log("Using fallback CSV processor");

  try {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error("Invalid CSV content");
    }

    // Sanitize content before processing
    const cleanContent = sanitizeTextForAPI(csvContent);
    
    // Parse the CSV content
    let rows: string[][] = [];
    try {
      rows = await parseCSV(cleanContent);
    } catch (parseError) {
      console.error("Error parsing CSV:", parseError);
      throw new Error(`Failed to parse CSV: ${parseError.message}`);
    }
    
    // Need at least a header row and one data row
    if (rows.length < 2) {
      throw new Error("CSV has insufficient data rows");
    }
    
    // Look for date, description, and amount columns
    const headers = rows[0].map(header => header.toLowerCase().trim());
    
    // Find potential column indices
    const dateColIndex = findColumnIndex(headers, ['date', 'transaction date', 'txn date', 'time', 'posted', 'effective date']);
    const descColIndex = findColumnIndex(headers, ['description', 'narrative', 'details', 'transaction', 'payee', 'merchant', 'particulars']);
    const amountColIndex = findColumnIndex(headers, ['amount', 'value', 'debit', 'credit', 'sum', 'transaction amount']);
    
    if (dateColIndex === -1 || descColIndex === -1 || amountColIndex === -1) {
      throw new Error("Could not identify required columns (date, description, amount) in CSV headers");
    }
    
    console.log(`Column mapping: Date=${dateColIndex}, Description=${descColIndex}, Amount=${amountColIndex}`);
    
    // Process data rows
    const transactions = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= 1) continue; // Skip empty rows
      
      if (dateColIndex >= row.length || descColIndex >= row.length || amountColIndex >= row.length) {
        console.warn(`Skipping row ${i}: insufficient columns`);
        continue;
      }
      
      const dateStr = row[dateColIndex]?.trim() || '';
      const description = row[descColIndex]?.trim() || '';
      const amountStr = row[amountColIndex]?.trim() || '';
      
      if (!dateStr || !description || !amountStr) {
        console.warn(`Skipping row ${i}: missing required data`);
        continue;
      }
      
      // Process the amount (consider different formats)
      const cleanAmount = cleanCurrencyValue(amountStr);
      const amount = parseFloat(cleanAmount);
      
      if (isNaN(amount)) {
        console.warn(`Skipping row ${i}: invalid amount "${amountStr}"`);
        continue;
      }
      
      // Try to parse the date
      let parsedDate;
      try {
        parsedDate = parseDate(dateStr);
      } catch (dateError) {
        console.warn(`Skipping row ${i}: invalid date "${dateStr}"`);
        continue;
      }
      
      // Create a transaction object
      transactions.push({
        date: parsedDate,
        description: description,
        amount: amount,
        type: amount < 0 ? 'debit' : 'credit'
      });
    }
    
    console.log(`Fallback processor found ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error("Fallback CSV processing error:", error);
    throw new Error(`Fallback processing failed: ${error.message}`);
  }
}

/**
 * Find a matching column index from headers array
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Clean currency values
 */
function cleanCurrencyValue(value: string): string {
  // Remove currency symbols, commas, and other non-numeric characters except decimal points and negative signs
  return value
    .replace(/[^0-9.-]/g, '')  // Remove anything that isn't a digit, decimal point or negative sign
    .replace(/(\d),(\d)/g, '$1$2') // Remove commas between digits if missed by previous regex
    .trim();
}

/**
 * Parse date from various formats to ISO format
 */
function parseDate(dateStr: string): string {
  // First, try to directly parse the date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  
  // Try common date formats
  // DD/MM/YYYY or DD-MM-YYYY
  const dmyRegex = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2}|\d{4})$/;
  const dmyMatch = dateStr.match(dmyRegex);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // Month is 0-indexed in JS Date
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000; // Assume 2-digit years are 2000s
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
  }
  
  // MM/DD/YYYY or MM-DD-YYYY (US format)
  const mdyRegex = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2}|\d{4})$/;
  const mdyMatch = dateStr.match(mdyRegex);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(mdyMatch[2], 10);
    let year = parseInt(mdyMatch[3], 10);
    if (year < 100) year += 2000; // Assume 2-digit years are 2000s
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
  }
  
  // If we can't parse the date, throw an error
  throw new Error(`Could not parse date: ${dateStr}`);
}
