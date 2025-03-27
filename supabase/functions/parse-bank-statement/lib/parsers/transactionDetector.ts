
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
    'trans date', 'entry date', 'transaction date', 'post date', 'effective date',
    'date posted', 'booking date', 'trade date', 'settlement date', 'date of transaction',
    'transaction time', 'datetime'
  ]);
  
  let descIndex = findColumnIndex(headers, [
    'description', 'desc', 'narrative', 'details', 'transaction description', 
    'particulars', 'narration', 'transaction narration', 'remarks', 'trans desc',
    'note', 'notes', 'memo', 'reference', 'payee', 'transaction details',
    'transaction information', 'payment details', 'transaction note', 'merchant',
    'merchant name', 'beneficiary', 'sender', 'payment reference'
  ]);
  
  let amountIndex = findColumnIndex(headers, [
    'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
    'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal', 'payment amount',
    'transaction value', 'money', 'cash', 'total', 'net amount', 'gross amount',
    'transaction sum', 'payment', 'fee', 'charge', 'balance', 'amount (ngn)', 'amt',
    'amount in naira', 'local amount', 'transaction fee', 'amount paid', 'price'
  ]);
  
  // Try to find separate debit and credit columns if amount column is not found
  let creditIndex = -1;
  let debitIndex = -1;
  
  if (amountIndex === -1) {
    creditIndex = findColumnIndex(headers, [
      'credit', 'deposit', 'cr', 'credit amount', 'inflow', 'money in', 'income',
      'incoming', 'received', 'money received', 'payment received', 'deposits', 
      'credits', 'cr amount', 'amount received', '+', 'plus', 'addition'
    ]);
    
    debitIndex = findColumnIndex(headers, [
      'debit', 'withdrawal', 'dr', 'debit amount', 'outflow', 'money out', 'expense',
      'outgoing', 'sent', 'money sent', 'payment sent', 'withdrawals', 'debits',
      'dr amount', 'amount sent', '-', 'minus', 'subtraction'
    ]);
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
  
  // Check the first 8 rows (or fewer if file is smaller)
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
  
  // Check up to 5 rows to identify date columns
  const rowsToCheck = Math.min(startRow + 5, rows.length);
  
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
  
  // Analyze multiple rows to increase accuracy
  const rowsToAnalyze = Math.min(5, rows.length - startRow);
  const textLengths: { [key: number]: number } = {};
  const numericValues: { [key: number]: number[] } = {};
  
  for (let i = 0; i < rowsToAnalyze; i++) {
    const rowIdx = startRow + i;
    const row = rows[rowIdx];
    
    if (!row || !Array.isArray(row)) continue;
    
    // Calculate average text length for each column
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      if (colIdx === dateIndex) continue; // Skip date column
      
      const value = String(row[colIdx] || '');
      
      // Track text length for description columns
      if (isNaN(Number(value))) {
        textLengths[colIdx] = (textLengths[colIdx] || 0) + value.length;
      } 
      // Track numeric values for amount columns
      else {
        if (!numericValues[colIdx]) numericValues[colIdx] = [];
        const numVal = parseAmount(value);
        if (!isNaN(numVal)) {
          numericValues[colIdx].push(numVal);
        }
      }
    }
  }
  
  // Find the column with the longest average text length as a candidate for description
  let maxAvgTextLength = 0;
  
  for (const colIdx in textLengths) {
    const avgLength = textLengths[colIdx] / rowsToAnalyze;
    if (avgLength > maxAvgTextLength) {
      maxAvgTextLength = avgLength;
      result.descIdx = parseInt(colIdx);
    }
  }
  
  // Analyze numeric columns to determine which might be amount, debit, or credit
  const numericColumns = Object.keys(numericValues).map(Number);
  
  if (numericColumns.length === 1) {
    // Only one numeric column, assume it's the amount column
    result.amtIdx = numericColumns[0];
  } else if (numericColumns.length >= 2) {
    // Multiple numeric columns - try to identify credit vs debit
    
    // Look for patterns in the data to distinguish between amount, debit, and credit columns
    const positiveOnly: number[] = [];
    const negativeOnly: number[] = [];
    const mixed: number[] = [];
    
    for (const colIdx of numericColumns) {
      const values = numericValues[colIdx];
      
      if (values.every(v => v >= 0)) {
        positiveOnly.push(colIdx);
      } else if (values.every(v => v <= 0)) {
        negativeOnly.push(colIdx);
      } else {
        mixed.push(colIdx);
      }
    }
    
    if (mixed.length === 1) {
      // One column has both positive and negative values, likely the main amount column
      result.amtIdx = mixed[0];
    } else if (positiveOnly.length === 1 && negativeOnly.length === 1) {
      // Likely separate credit and debit columns
      result.creditIdx = positiveOnly[0];
      result.debitIdx = negativeOnly[0];
    } else if (positiveOnly.length >= 2) {
      // Multiple positive columns, choose the two with the highest absolute values
      let highest = -1;
      let secondHighest = -1;
      let highestSum = 0;
      let secondHighestSum = 0;
      
      for (const colIdx of positiveOnly) {
        const sum = numericValues[colIdx].reduce((a, b) => a + b, 0);
        if (sum > highestSum) {
          secondHighestSum = highestSum;
          secondHighest = highest;
          highestSum = sum;
          highest = colIdx;
        } else if (sum > secondHighestSum) {
          secondHighestSum = sum;
          secondHighest = colIdx;
        }
      }
      
      if (highest !== -1 && secondHighest !== -1) {
        result.creditIdx = highest;
        result.debitIdx = secondHighest;
      } else if (highest !== -1) {
        result.amtIdx = highest;
      }
    } else if (numericColumns.length > 0) {
      // Default: use the first numeric column as amount
      result.amtIdx = numericColumns[0];
    }
  }
  
  return result;
}

// New function to guess columns by analyzing data types in the rows
function guessColumnsByDataType(rows: any[], headerRowIndex: number): { 
  dateIndex: number, 
  descIndex: number, 
  amountIndex: number,
  creditIndex: number,
  debitIndex: number
} {
  const startRow = headerRowIndex + 1;
  const result = { 
    dateIndex: -1, 
    descIndex: -1, 
    amountIndex: -1,
    creditIndex: -1,
    debitIndex: -1
  };
  
  if (startRow >= rows.length || rows.length < startRow + 3) {
    return result;
  }
  
  const columnTypes: { [key: number]: { 
    isDate: number, 
    isText: number, 
    isNumber: number,
    textLength: number,
    numValues: number[]
  } } = {};
  
  // Analyze rows to determine column types
  const rowsToCheck = Math.min(10, rows.length - startRow);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[startRow + i];
    if (!row || !Array.isArray(row)) continue;
    
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      if (!columnTypes[colIdx]) {
        columnTypes[colIdx] = { 
          isDate: 0, 
          isText: 0, 
          isNumber: 0,
          textLength: 0,
          numValues: []
        };
      }
      
      const value = row[colIdx];
      const strValue = String(value || '');
      
      // Check if value looks like a date
      const dateObj = parseDate(strValue);
      if (dateObj && !isNaN(dateObj.getTime())) {
        columnTypes[colIdx].isDate++;
      }
      
      // Check if value is numeric
      const numValue = parseAmount(value);
      if (!isNaN(numValue)) {
        columnTypes[colIdx].isNumber++;
        columnTypes[colIdx].numValues.push(numValue);
      }
      
      // Check if value is text
      if (isNaN(Number(strValue)) && strValue.length > 0) {
        columnTypes[colIdx].isText++;
        columnTypes[colIdx].textLength += strValue.length;
      }
    }
  }
  
  // Find the most likely date column
  let bestDateScore = 0;
  for (const colIdx in columnTypes) {
    const col = columnTypes[colIdx];
    const dateScore = col.isDate / rowsToCheck;
    
    if (dateScore > 0.5 && dateScore > bestDateScore) {
      bestDateScore = dateScore;
      result.dateIndex = parseInt(colIdx);
    }
  }
  
  // Find the most likely description column (text with highest average length)
  let bestTextLength = 0;
  for (const colIdx in columnTypes) {
    if (parseInt(colIdx) === result.dateIndex) continue;
    
    const col = columnTypes[colIdx];
    const textScore = col.isText / rowsToCheck;
    const avgLength = col.textLength / (col.isText || 1);
    
    if (textScore > 0.5 && avgLength > bestTextLength) {
      bestTextLength = avgLength;
      result.descIndex = parseInt(colIdx);
    }
  }
  
  // Find numeric columns for amount/credit/debit
  const numericColumns: number[] = [];
  for (const colIdx in columnTypes) {
    if (
      parseInt(colIdx) === result.dateIndex || 
      parseInt(colIdx) === result.descIndex
    ) continue;
    
    const col = columnTypes[colIdx];
    const numScore = col.isNumber / rowsToCheck;
    
    if (numScore > 0.5) {
      numericColumns.push(parseInt(colIdx));
    }
  }
  
  if (numericColumns.length === 1) {
    result.amountIndex = numericColumns[0];
  } else if (numericColumns.length >= 2) {
    // Try to distinguish between amount, credit, and debit columns
    const columnProperties: { 
      colIdx: number, 
      positiveCount: number, 
      negativeCount: number, 
      zeroCount: number,
      totalValue: number 
    }[] = [];
    
    for (const colIdx of numericColumns) {
      const values = columnTypes[colIdx].numValues;
      const positiveCount = values.filter(v => v > 0).length;
      const negativeCount = values.filter(v => v < 0).length;
      const zeroCount = values.filter(v => v === 0).length;
      const totalValue = values.reduce((sum, val) => sum + Math.abs(val), 0);
      
      columnProperties.push({
        colIdx,
        positiveCount,
        negativeCount,
        zeroCount,
        totalValue
      });
    }
    
    // Sort by total absolute value (higher first)
    columnProperties.sort((a, b) => b.totalValue - a.totalValue);
    
    if (columnProperties.length > 0) {
      const firstCol = columnProperties[0];
      
      if (firstCol.positiveCount > 0 && firstCol.negativeCount > 0) {
        // Column has both positive and negative values, likely the main amount column
        result.amountIndex = firstCol.colIdx;
      } else if (columnProperties.length >= 2) {
        // Look for separate credit and debit columns
        let creditCol = -1;
        let debitCol = -1;
        
        for (const prop of columnProperties) {
          if (prop.positiveCount > prop.negativeCount && creditCol === -1) {
            creditCol = prop.colIdx;
          } else if (prop.negativeCount > 0 || prop.totalValue > 0) {
            // Either has negative values or has positive values but not assigned as credit yet
            debitCol = prop.colIdx;
            break;
          }
        }
        
        if (creditCol !== -1 && debitCol !== -1) {
          result.creditIndex = creditCol;
          result.debitIndex = debitCol;
        } else {
          // Just use the first column as amount
          result.amountIndex = firstCol.colIdx;
        }
      } else {
        // Just one numeric column with either all positive or all negative values
        result.amountIndex = firstCol.colIdx;
      }
    }
  }
  
  return result;
}
