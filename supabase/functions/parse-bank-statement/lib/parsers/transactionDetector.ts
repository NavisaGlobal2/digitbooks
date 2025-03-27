
import { Transaction, TransactionType } from '../types.ts'

// Import refactored components
import { findHeaderRow, findColumnIndex } from './detectors/headerDetector.ts'
import { guessPrimaryDateColumn } from './detectors/dateColumnDetector.ts'
import { guessColumnsFromSample } from './detectors/columnGuesser.ts'
import { guessColumnsByDataType } from './detectors/dataTypeAnalyzer.ts'
import { parseTransactionsFromRows } from './parsers/rowParser.ts'
import { getColumnPatterns } from './constants/columnPatterns.ts'

// Define column patterns for detection
const columnPatterns = getColumnPatterns()

// Main entry point for transaction detection
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
  let dateIndex = findColumnIndex(headers, columnPatterns.DATE_COLUMN_PATTERNS);
  let descIndex = findColumnIndex(headers, columnPatterns.DESCRIPTION_COLUMN_PATTERNS);
  let amountIndex = findColumnIndex(headers, columnPatterns.AMOUNT_COLUMN_PATTERNS);
  
  // Try to find separate debit and credit columns if amount column is not found
  let creditIndex = -1;
  let debitIndex = -1;
  
  // Check for credit/debit columns even if amount is found 
  // as Nigerian banks often have both amount and separate credit/debit columns
  creditIndex = findColumnIndex(headers, columnPatterns.CREDIT_COLUMN_PATTERNS);
  debitIndex = findColumnIndex(headers, columnPatterns.DEBIT_COLUMN_PATTERNS);
  
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
