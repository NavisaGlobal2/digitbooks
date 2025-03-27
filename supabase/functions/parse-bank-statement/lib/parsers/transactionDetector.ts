
import { Transaction, TransactionType } from '../types.ts'
import { parseAmount, parseDate, formatDate } from './helpers.ts'

// Import refactored components
import { findHeaderRow, findColumnIndex } from './detectors/headerDetector.ts'
import { guessPrimaryDateColumn } from './detectors/dateColumnDetector.ts'
import { guessColumnsFromSample } from './detectors/columnGuesser.ts'
import { guessColumnsByDataType } from './detectors/dataTypeAnalyzer.ts'

// Define column name patterns for more readable code
const DATE_COLUMN_PATTERNS = [
  'date', 'transaction date', 'txn date', 'value date', 'posting date', 
  'trans date', 'entry date', 'transaction date', 'post date', 'effective date',
  'date posted', 'booking date', 'trade date', 'settlement date', 'date of transaction',
  'transaction time', 'datetime', 'val date', 'val. date', 'value. date', 'date value'
];

const DESCRIPTION_COLUMN_PATTERNS = [
  'description', 'desc', 'narrative', 'details', 'transaction description', 
  'particulars', 'narration', 'transaction narration', 'remarks', 'trans desc',
  'note', 'notes', 'memo', 'reference', 'payee', 'transaction details',
  'transaction information', 'payment details', 'transaction note', 'merchant',
  'merchant name', 'beneficiary', 'sender', 'payment reference', 'remarks', 'trans. details'
];

const AMOUNT_COLUMN_PATTERNS = [
  'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
  'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal', 'payment amount',
  'transaction value', 'money', 'cash', 'total', 'net amount', 'gross amount',
  'transaction sum', 'payment', 'fee', 'charge', 'balance', 'amount (ngn)', 'amt',
  'amount in naira', 'local amount', 'transaction fee', 'amount paid', 'price',
  'inflow', 'outflow', 'deposit', 'withdrawal'
];

const CREDIT_COLUMN_PATTERNS = [
  'credit', 'deposit', 'cr', 'credit amount', 'inflow', 'money in', 'income',
  'incoming', 'received', 'money received', 'payment received', 'deposits', 
  'credits', 'cr amount', 'amount received', '+', 'plus', 'addition'
];

const DEBIT_COLUMN_PATTERNS = [
  'debit', 'withdrawal', 'dr', 'debit amount', 'outflow', 'money out', 'expense',
  'outgoing', 'sent', 'money sent', 'payment sent', 'withdrawals', 'debits',
  'dr amount', 'amount sent', '-', 'minus', 'subtraction'
];

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
  let dateIndex = findColumnIndex(headers, DATE_COLUMN_PATTERNS);
  let descIndex = findColumnIndex(headers, DESCRIPTION_COLUMN_PATTERNS);
  let amountIndex = findColumnIndex(headers, AMOUNT_COLUMN_PATTERNS);
  
  // Try to find separate debit and credit columns if amount column is not found
  let creditIndex = -1;
  let debitIndex = -1;
  
  if (amountIndex === -1) {
    creditIndex = findColumnIndex(headers, CREDIT_COLUMN_PATTERNS);
    debitIndex = findColumnIndex(headers, DEBIT_COLUMN_PATTERNS);
  }
  
  // If we still can't determine columns, try positional guessing with stronger heuristics
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
  
  // Make one last attempt with column type analysis if we're still missing indices
  if (dateIndex === -1 || descIndex === -1 || (amountIndex === -1 && creditIndex === -1 && debitIndex === -1)) {
    console.log('Still missing required columns, attempting type-based analysis');
    const indices = guessColumnsByDataType(rows, headerRowIndex);
    
    // Only use guessed indices if the corresponding index is still missing
    if (dateIndex === -1) dateIndex = indices.dateIndex;
    if (descIndex === -1) descIndex = indices.descIndex;
    if (amountIndex === -1 && creditIndex === -1 && debitIndex === -1) {
      amountIndex = indices.amountIndex;
      creditIndex = indices.creditIndex;
      debitIndex = indices.debitIndex;
    }
  }
  
  // If we still can't determine columns, throw an error
  if (dateIndex === -1 || descIndex === -1 || (amountIndex === -1 && creditIndex === -1 && debitIndex === -1)) {
    console.error('Could not identify required columns');
    throw new Error('Could not identify required columns (date, description, amount) in the file. Please check if your file contains these columns and try again.')
  }
  
  // Parse transactions from rows, skipping header
  return parseTransactionsFromRows(
    rows, 
    headerRowIndex, 
    dateIndex, 
    descIndex, 
    amountIndex, 
    creditIndex, 
    debitIndex
  );
}

// Function to parse the actual transactions from data rows
function parseTransactionsFromRows(
  rows: any[],
  headerRowIndex: number,
  dateIndex: number,
  descIndex: number,
  amountIndex: number,
  creditIndex: number,
  debitIndex: number
): Transaction[] {
  const transactions: Transaction[] = [];
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    let dateValue = row[dateIndex];
    let description = String(row[descIndex] || '');
    
    // Skip rows with missing essential data
    if (!dateValue || !description) continue;
    
    // Parse date
    let parsedDate = parseDate(dateValue);
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) continue;
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0];
    
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
    } else if (creditIndex !== -1) {
      // Only credit column exists
      amount = parseAmount(row[creditIndex]);
      if (amount > 0) type = 'credit';
    } else if (debitIndex !== -1) {
      // Only debit column exists
      amount = parseAmount(row[debitIndex]);
      if (amount > 0) type = 'debit';
    }
    
    // Skip if there's no valid amount
    if (amount === 0) continue;
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    });
  }
  
  return transactions;
}
