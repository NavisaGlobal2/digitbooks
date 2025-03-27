
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
  
  console.log('Starting transaction detection on data with rows:', rows.length);
  
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
  
  // Check for credit/debit columns even if amount is found 
  // as Nigerian banks often have both amount and separate credit/debit columns
  creditIndex = findColumnIndex(headers, CREDIT_COLUMN_PATTERNS);
  debitIndex = findColumnIndex(headers, DEBIT_COLUMN_PATTERNS);
  
  console.log(`Column indices - Date: ${dateIndex}, Desc: ${descIndex}, Amount: ${amountIndex}, Credit: ${creditIndex}, Debit: ${debitIndex}`);
  
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
      
      console.log(`After guessing - Date: ${dateIndex}, Desc: ${descIndex}, Amount: ${amountIndex}, Credit: ${creditIndex}, Debit: ${debitIndex}`);
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
    
    console.log(`After type analysis - Date: ${dateIndex}, Desc: ${descIndex}, Amount: ${amountIndex}, Credit: ${creditIndex}, Debit: ${debitIndex}`);
  }
  
  // If we still can't determine columns, try a final desperate effort to look for columns with DR/CR markers
  if (dateIndex !== -1 && descIndex !== -1 && amountIndex === -1 && creditIndex === -1 && debitIndex === -1) {
    // Nigerian banks often combine descriptions with DR/CR indicators
    console.log('Looking for DR/CR markers in description field as a last resort');
    for (let i = 0; i < headers.length; i++) {
      if (i !== dateIndex && i !== descIndex) {
        // Check if this column contains numeric data and can be used as amount
        let hasNumbers = false;
        for (let j = headerRowIndex + 1; j < Math.min(headerRowIndex + 10, rows.length); j++) {
          if (rows[j] && rows[j][i] && !isNaN(parseFloat(String(rows[j][i]).replace(/[^0-9.-]+/g, '')))) {
            hasNumbers = true;
            break;
          }
        }
        
        if (hasNumbers) {
          console.log(`Found potential amount column at index ${i} with header: ${headers[i]}`);
          amountIndex = i;
          break;
        }
      }
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
  
  console.log(`Starting row parsing with ${rows.length - (headerRowIndex + 1)} data rows`);
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    let dateValue = row[dateIndex];
    let description = String(row[descIndex] || '');
    
    // Skip rows with missing essential data
    if (!dateValue || !description) {
      console.log(`Skipping row ${i} - missing date or description`);
      continue;
    }
    
    // Skip rows with placeholder data patterns (common in Nigerian bank statements)
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('opening balance') || 
        lowerDesc.includes('closing balance') || 
        lowerDesc.includes('b/fwd') || 
        lowerDesc.includes('brought forward') ||
        lowerDesc.includes('c/fwd')) {
      console.log(`Skipping row ${i} - balance row: ${description}`);
      continue;
    }
    
    // Parse date
    let parsedDate = parseDate(dateValue);
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      console.log(`Skipping row ${i} - invalid date: ${dateValue}`);
      continue;
    }
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0];
    
    // Parse amount and determine transaction type
    let amount: number = 0;
    let type: TransactionType = 'unknown';
    
    // Check for Nigerian bank-specific patterns in description
    const hasDebitMarker = lowerDesc.includes(' dr') || lowerDesc.includes('(dr)') || lowerDesc.endsWith('dr');
    const hasCreditMarker = lowerDesc.includes(' cr') || lowerDesc.includes('(cr)') || lowerDesc.endsWith('cr');
    
    // First check for dedicated debit/credit columns
    if (debitIndex !== -1 && row[debitIndex] && parseAmount(row[debitIndex]) > 0) {
      amount = parseAmount(row[debitIndex]);
      type = 'debit';
      console.log(`Row ${i} - Found debit amount ${amount} in dedicated column`);
    } else if (creditIndex !== -1 && row[creditIndex] && parseAmount(row[creditIndex]) > 0) {
      amount = parseAmount(row[creditIndex]);
      type = 'credit';
      console.log(`Row ${i} - Found credit amount ${amount} in dedicated column`);
    } else if (amountIndex !== -1) {
      // Single amount column - check for DR/CR markers in description first
      const rawAmount = String(row[amountIndex]);
      amount = parseAmount(rawAmount);
      
      if (amount > 0) {
        // First check description for DR/CR indicators
        if (hasDebitMarker) {
          type = 'debit';
          console.log(`Row ${i} - Detected debit from description marker: ${description}`);
        } else if (hasCreditMarker) {
          type = 'credit';
          console.log(`Row ${i} - Detected credit from description marker: ${description}`);
        } else {
          // Check amount string formatting for clues
          const amountStr = rawAmount.toLowerCase();
          if (amountStr.includes('dr') || amountStr.includes('-') || amountStr.startsWith('-')) {
            type = 'debit';
            console.log(`Row ${i} - Detected debit from amount formatting: ${rawAmount}`);
          } else if (amountStr.includes('cr') || amountStr.includes('+')) {
            type = 'credit';
            console.log(`Row ${i} - Detected credit from amount formatting: ${rawAmount}`);
          } else {
            // Look for DR/CR indicators in surrounding columns
            let typeFound = false;
            for (let j = 0; j < row.length; j++) {
              if (j !== amountIndex && j !== dateIndex && j !== descIndex) {
                const cellValue = String(row[j] || '').toLowerCase();
                if (cellValue === 'dr' || cellValue === 'debit') {
                  type = 'debit';
                  typeFound = true;
                  console.log(`Row ${i} - Found debit indicator in column ${j}`);
                  break;
                } else if (cellValue === 'cr' || cellValue === 'credit') {
                  type = 'credit';
                  typeFound = true;
                  console.log(`Row ${i} - Found credit indicator in column ${j}`);
                  break;
                }
              }
            }
            
            if (!typeFound) {
              // Some Nigerian bank statements have a pattern where debits reduce the balance
              // Try to use this as a heuristic if we have a balance column
              let balanceIndex = -1;
              for (let j = 0; j < headers.length; j++) {
                if (String(headers[j]).toLowerCase().includes('balance')) {
                  balanceIndex = j;
                  break;
                }
              }
              
              if (balanceIndex !== -1 && i > headerRowIndex + 1) {
                // Compare with previous row's balance
                const prevBalance = parseAmount(String(rows[i-1][balanceIndex] || 0));
                const currBalance = parseAmount(String(row[balanceIndex] || 0));
                
                if (!isNaN(prevBalance) && !isNaN(currBalance)) {
                  if (currBalance < prevBalance) {
                    type = 'debit';
                    console.log(`Row ${i} - Detected debit by balance reduction`);
                  } else if (currBalance > prevBalance) {
                    type = 'credit';
                    console.log(`Row ${i} - Detected credit by balance increase`);
                  }
                }
              }
              
              if (type === 'unknown') {
                // As a last resort, assume debit for statements (conservative approach)
                type = 'debit';
                console.log(`Row ${i} - Defaulting to debit as conservative approach`);
              }
            }
          }
        }
      }
    }
    
    // Skip if there's no valid amount
    if (amount === 0) {
      console.log(`Skipping row ${i} - zero amount`);
      continue;
    }
    
    // Log the transaction we're about to add for debugging
    console.log(`Adding ${type} transaction: ${formattedDate} | ${description} | ${amount}`);
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    });
  }
  
  console.log(`Detected ${transactions.length} transactions (${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits)`);
  
  return transactions;
}
