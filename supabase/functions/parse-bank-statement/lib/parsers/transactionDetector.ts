
import { Transaction, TransactionType } from '../types.ts'
import { parseAmount, parseDate } from './helpers.ts'

// Detect and parse transactions from row data
export function detectAndParseTransactions(rows: any[]): Transaction[] {
  if (rows.length < 2) {
    throw new Error('File contains insufficient data')
  }
  
  // Try to find the header row
  let headerRowIndex = findHeaderRow(rows);
  let headers = rows[headerRowIndex];
  
  // Convert headers to lowercase strings for easier comparison
  headers = headers.map((h: any) => String(h || '').toLowerCase().trim());
  
  console.log('Detected headers:', headers);
  
  // Try to determine column indices with expanded options
  let dateIndex = findColumnIndex(headers, [
    'date', 'transaction date', 'txn date', 'value date', 'posting date', 
    'trans date', 'entry date', 'transaction date'
  ]);
  
  let descIndex = findColumnIndex(headers, [
    'description', 'desc', 'narrative', 'details', 'transaction description', 
    'particulars', 'narration', 'transaction narration', 'remarks', 'trans desc'
  ]);
  
  let amountIndex = findColumnIndex(headers, [
    'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
    'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal'
  ]);
  
  // Try to find separate debit and credit columns if amount column is not found
  let creditIndex = -1;
  let debitIndex = -1;
  
  if (amountIndex === -1) {
    creditIndex = findColumnIndex(headers, ['credit', 'deposit', 'cr', 'credit amount']);
    debitIndex = findColumnIndex(headers, ['debit', 'withdrawal', 'dr', 'debit amount']);
  }
  
  // If we still can't determine columns, try positional guessing
  if ((dateIndex === -1 || descIndex === -1) && (amountIndex === -1 && creditIndex === -1 && debitIndex === -1)) {
    console.log('Could not identify columns from headers, trying positional guessing');
    
    // Analyze the data rows to guess column positions
    dateIndex = guessPrimaryDateColumn(rows, headerRowIndex);
    
    if (dateIndex !== -1) {
      // Look for description and amount columns
      const { descIdx, amtIdx, creditIdx, debitIdx } = guessColumnsFromSample(rows, headerRowIndex, dateIndex);
      
      descIndex = descIdx;
      amountIndex = amtIdx;
      creditIndex = creditIdx;
      debitIndex = debitIdx;
    }
  }
  
  // If we still can't determine columns, throw an error
  if (dateIndex === -1 || descIndex === -1 || (amountIndex === -1 && creditIndex === -1 && debitIndex === -1)) {
    console.error('Could not identify required columns');
    throw new Error('Could not identify required columns (date, description, amount) in the file')
  }
  
  // Parse transactions from rows, skipping header
  const transactions: Transaction[] = []
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    
    let dateValue = row[dateIndex]
    let description = String(row[descIndex] || '')
    
    // Skip rows with missing essential data
    if (!dateValue || !description) continue
    
    // Parse date
    let parsedDate = parseDate(dateValue);
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) continue
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0]
    
    // Parse amount and determine transaction type
    let amount: number = 0;
    let type: TransactionType = 'unknown';
    
    if (amountIndex !== -1) {
      // Single amount column
      amount = parseAmount(row[amountIndex]);
      
      // Determine type based on sign
      type = amount < 0 ? 'debit' : amount > 0 ? 'credit' : 'unknown';
      
      // Use absolute value for the amount
      amount = Math.abs(amount);
    } else if (creditIndex !== -1 && debitIndex !== -1) {
      // Separate credit and debit columns
      const creditAmount = parseAmount(row[creditIndex]);
      const debitAmount = parseAmount(row[debitIndex]);
      
      if (debitAmount > 0) {
        amount = debitAmount;
        type = 'debit';
      } else if (creditAmount > 0) {
        amount = creditAmount;
        type = 'credit';
      }
    }
    
    // Skip if there's no valid amount
    if (amount === 0) continue;
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    })
  }
  
  return transactions
}

// Helper function to find the likely header row
function findHeaderRow(rows: any[]): number {
  // Common header keywords to look for
  const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance'];
  
  // Check the first 5 rows (or fewer if file is smaller)
  const rowsToCheck = Math.min(8, rows.length);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    const rowStr = row.map((cell: any) => String(cell || '').toLowerCase()).join(' ');
    
    // Count how many header keywords are found in this row
    let keywordMatches = 0;
    for (const keyword of headerKeywords) {
      if (rowStr.includes(keyword)) keywordMatches++;
    }
    
    // If at least 2 keywords match, this is likely a header row
    if (keywordMatches >= 2) {
      return i;
    }
  }
  
  // Fallback: assume first row is header
  return 0;
}

// Helper function to find column index by trying multiple possible headers
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  // First try exact matches
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h === name);
    if (index !== -1) return index;
  }
  
  // Then try partial matches
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  
  // Finally try if any header contains any of the names
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    for (const name of possibleNames) {
      if (name.includes(header)) return i;
    }
  }
  
  return -1;
}

// Helper function to guess which column might contain dates
function guessPrimaryDateColumn(rows: any[], headerRowIndex: number): number {
  // Skip the header row
  const startRow = headerRowIndex + 1;
  if (startRow >= rows.length) return -1;
  
  // Look at data rows and check each column for date-like values
  const dateLikeColumns: number[] = [];
  
  // Check up to 3 rows to identify date columns
  const rowsToCheck = Math.min(startRow + 3, rows.length);
  
  for (let rowIdx = startRow; rowIdx < rowsToCheck; rowIdx++) {
    const row = rows[rowIdx];
    if (!row || !Array.isArray(row)) continue;
    
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const value = String(row[colIdx] || '');
      
      // Check if this looks like a date
      if (/\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}/.test(value) || 
          !isNaN(Date.parse(value)) ||
          (typeof row[colIdx] === 'number' && row[colIdx] > 30000 && row[colIdx] < 50000)) { // Excel date range
        
        if (!dateLikeColumns.includes(colIdx)) {
          dateLikeColumns.push(colIdx);
        }
      }
    }
  }
  
  // If we found multiple date-like columns, prefer the first one
  return dateLikeColumns.length > 0 ? dateLikeColumns[0] : -1;
}

// Helper function to guess description and amount columns based on the date column
function guessColumnsFromSample(rows: any[], headerRowIndex: number, dateIndex: number): { descIdx: number, amtIdx: number, creditIdx: number, debitIdx: number } {
  const startRow = headerRowIndex + 1;
  
  // Default result
  const result = { descIdx: -1, amtIdx: -1, creditIdx: -1, debitIdx: -1 };
  
  if (startRow >= rows.length) return result;
  
  const row = rows[startRow];
  if (!row || !Array.isArray(row)) return result;
  
  // Find the longest text field as a candidate for description
  let maxTextLength = 0;
  
  for (let i = 0; i < row.length; i++) {
    if (i === dateIndex) continue; // Skip date column
    
    const value = String(row[i] || '');
    if (value.length > maxTextLength && isNaN(Number(value))) {
      maxTextLength = value.length;
      result.descIdx = i;
    }
  }
  
  // Find numeric columns that might be amount, debit, or credit
  const numericColumns: number[] = [];
  
  for (let i = 0; i < row.length; i++) {
    if (i === dateIndex || i === result.descIdx) continue; // Skip already identified columns
    
    const value = String(row[i] || '').replace(/[,$€£₦\s]/g, '');
    if (!isNaN(Number(value)) && value.trim() !== '') {
      numericColumns.push(i);
    }
  }
  
  // If we found numeric columns, use the first one for amount
  if (numericColumns.length === 1) {
    result.amtIdx = numericColumns[0];
  } else if (numericColumns.length >= 2) {
    // If we have at least two numeric columns, they might be debit and credit
    result.debitIdx = numericColumns[0];
    result.creditIdx = numericColumns[1];
  }
  
  return result;
}

