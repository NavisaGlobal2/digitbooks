
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import * as XLSX from 'xlsx';

export const parseExcelFile = async (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  try {
    // Load XLSX library dynamically if it's not already available
    if (typeof XLSX === 'undefined') {
      // Inform user we're loading the library
      toast.info("Loading Excel parser...");
      
      // Load the library dynamically
      const XLSX = await import('xlsx');
      parseExcelWithLib(XLSX, file, onComplete, onError);
    } else {
      // Use the already loaded library
      parseExcelWithLib(XLSX, file, onComplete, onError);
    }
  } catch (error) {
    console.error('Error in parseExcelFile:', error);
    onError("Failed to load Excel parser. Please try using CSV format instead.");
  }
};

const parseExcelWithLib = (XLSX: any, file: File, onComplete: (transactions: ParsedTransaction[]) => void, onError: (errorMessage: string) => void) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (rows.length <= 1) {
        onError('The Excel file does not contain enough data.');
        return;
      }
      
      console.log('Excel rows detected:', rows.slice(0, 3));
      
      // Improved header detection - check first 10 rows to find the most likely header
      let headerRowIndex = findHeaderRowImproved(rows);
      
      if (headerRowIndex === -1) {
        console.error('Could not identify a header row in Excel file');
        // If no header found, try an alternative detection approach
        const detectedColumns = detectColumnsWithoutHeaders(rows);
        
        if (detectedColumns.dateCol === -1 || 
            detectedColumns.descCol === -1 || 
            (detectedColumns.amountCol === -1 && 
             detectedColumns.creditCol === -1 && 
             detectedColumns.debitCol === -1)) {
          onError('Could not identify column headers in your Excel file. Please ensure your file has data for date, description/narrative, and amount columns.');
          return;
        }
        
        // Use the detected columns to extract transactions
        const transactions = extractTransactionsWithoutHeaders(rows, detectedColumns);
        
        if (transactions.length === 0) {
          onError('No valid transactions found in the Excel file. Please check the format.');
        } else {
          console.log('Successfully parsed', transactions.length, 'transactions from Excel without headers');
          onComplete(transactions);
        }
        return;
      }
      
      // Successfully found headers
      const headers = rows[headerRowIndex].map(h => String(h).trim().toLowerCase());
      console.log('Detected headers:', headers);
      
      // Enhanced column name detection with wider pattern matching
      // Changed from const to let since we need to reassign these values later
      let dateColIndex = findColumnIndexImproved(headers, [
        'date', 'transaction date', 'txn date', 'value date', 'posting date', 'trans date', 'entry date',
        'transaction time', 'post date', 'effective date', 'date posted', 'booking date', 'trade date',
        'settlement date', 'transaction day', 'day', 'time', 'datetime'
      ]);
      
      let descColIndex = findColumnIndexImproved(headers, [
        'description', 'desc', 'narrative', 'details', 'transaction description', 'particulars', 
        'narration', 'transaction narration', 'remarks', 'trans desc', 'note', 'notes', 'memo', 
        'reference', 'payee', 'transaction details', 'transaction information', 'payment details',
        'merchant', 'merchant name', 'beneficiary', 'transaction note', 'sender', 'payment reference'
      ]);
      
      let amountColIndex = findColumnIndexImproved(headers, [
        'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
        'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal', 'payment amount',
        'transaction value', 'money', 'cash', 'total', 'net amount', 'gross amount',
        'transaction sum', 'payment', 'fee', 'charge', 'balance', 'amount (ngn)', 'amt',
        'amount in naira', 'local amount', 'transaction fee', 'amount paid', 'price'
      ]);
      
      // Try to find separate debit and credit columns if amount column is not found
      let creditColIndex = -1;
      let debitColIndex = -1;
      
      if (amountColIndex === -1) {
        creditColIndex = findColumnIndexImproved(headers, [
          'credit', 'deposit', 'cr', 'credit amount', 'inflow', 'money in', 'income',
          'incoming', 'received', 'money received', 'payment received', 'deposits', 
          'credits', 'cr amount', 'amount received', '+', 'plus', 'addition'
        ]);
        
        debitColIndex = findColumnIndexImproved(headers, [
          'debit', 'withdrawal', 'dr', 'debit amount', 'outflow', 'money out', 'expense',
          'outgoing', 'sent', 'money sent', 'payment sent', 'withdrawals', 'debits',
          'dr amount', 'amount sent', '-', 'minus', 'subtraction'
        ]);
      }
      
      // If still not found, use position-based detection as last resort
      if ((dateColIndex === -1 || descColIndex === -1) &&
          (amountColIndex === -1 && creditColIndex === -1 && debitColIndex === -1)) {
            
        // Last resort: try to guess columns by position and data type
        const detectedColumns = detectColumnsByDataType(rows, headerRowIndex);
        
        // Use any detected columns that weren't found by name
        if (dateColIndex === -1) dateColIndex = detectedColumns.dateCol;
        if (descColIndex === -1) descColIndex = detectedColumns.descCol;
        if (amountColIndex === -1 && creditColIndex === -1 && debitColIndex === -1) {
          amountColIndex = detectedColumns.amountCol;
          creditColIndex = detectedColumns.creditCol;
          debitColIndex = detectedColumns.debitCol;
        }
      }
      
      if (dateColIndex === -1 || descColIndex === -1) {
        console.error('Could not identify required date or description columns', headers);
        onError('Could not identify the date and description columns in your Excel file. Please try a different format or check our supported bank templates.');
        return;
      }
      
      if (amountColIndex === -1 && creditColIndex === -1 && debitColIndex === -1) {
        console.error('Could not identify amount columns', headers);
        onError('Could not identify amount columns in your Excel file. Please ensure your file has amount data.');
        return;
      }
      
      const transactions: ParsedTransaction[] = [];
      
      // Process each row (skipping header)
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row || row.length === 0 || isEmptyRow(row)) continue;
        
        // Skip rows with insufficient data
        if (row.length <= Math.max(dateColIndex, descColIndex, amountColIndex, creditColIndex, debitColIndex)) {
          continue;
        }
        
        try {
          // Parse date - try multiple formats
          let dateValue = row[dateColIndex];
          let date: Date | null = parseExcelDate(dateValue, XLSX);
          
          if (!date || isNaN(date.getTime())) {
            console.warn('Could not parse date:', dateValue);
            continue;
          }
          
          // Parse description
          const description = String(row[descColIndex] || '').trim();
          if (!description) continue;
          
          // Parse amount
          let amount: number = 0;
          let type: 'debit' | 'credit' = 'debit';
          
          if (amountColIndex !== -1) {
            // Single amount column
            const amountValue = row[amountColIndex];
            const result = parseAmountWithType(amountValue);
            amount = result.amount;
            type = result.type;
          } else {
            // Separate debit and credit columns
            const debitValue = debitColIndex !== -1 ? row[debitColIndex] : null;
            const creditValue = creditColIndex !== -1 ? row[creditColIndex] : null;
            
            const debitAmount = debitValue !== null ? parseAmount(debitValue) : 0;
            const creditAmount = creditValue !== null ? parseAmount(creditValue) : 0;
            
            if (debitAmount > 0) {
              amount = debitAmount;
              type = 'debit';
            } else if (creditAmount > 0) {
              amount = creditAmount;
              type = 'credit';
            } else {
              // Skip rows with no amount information
              continue;
            }
          }
          
          if (isNaN(amount) || amount === 0) {
            console.warn('Could not parse amount or amount is zero:', row[amountColIndex]);
            continue;
          }
          
          transactions.push({
            id: `trans-${i}`,
            date,
            description,
            amount,
            type,
            selected: type === 'debit',
          });
        } catch (err) {
          console.warn('Error parsing row:', err, row);
          // Continue to the next row
        }
      }
      
      if (transactions.length === 0) {
        onError('No valid transactions found in the Excel file. Please check the format.');
      } else {
        console.log('Successfully parsed', transactions.length, 'transactions from Excel');
        onComplete(transactions);
      }
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      onError('Failed to parse the Excel file. Please check the format and try again.');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read the Excel file');
  };
  
  reader.readAsArrayBuffer(file);
};

// Helper function to check if a row is empty
const isEmptyRow = (row: any[]): boolean => {
  return row.every(cell => cell === '' || cell === null || cell === undefined);
};

// Helper function to find the likely header row with improved heuristics
const findHeaderRowImproved = (rows: any[]): number => {
  // Common header keywords to look for
  const headerKeywords = [
    'date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance',
    'narrative', 'reference', 'details', 'value', 'withdrawal', 'deposit'
  ];
  
  // Check the first 10 rows (or fewer if file is smaller)
  const rowsToCheck = Math.min(10, rows.length);
  
  const rowScores: { index: number, score: number }[] = [];
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || isEmptyRow(row)) continue;
    
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    
    // Count how many header keywords are found in this row
    let keywordMatches = 0;
    for (const keyword of headerKeywords) {
      if (rowStr.includes(keyword)) keywordMatches++;
    }
    
    // Give extra weight to rows that have more non-empty cells
    const nonEmptyCells = row.filter(cell => cell !== '' && cell !== null && cell !== undefined).length;
    const cellScore = nonEmptyCells / row.length;
    
    // Calculate final score
    const score = keywordMatches + cellScore;
    
    rowScores.push({ index: i, score });
  }
  
  // Find the row with the highest score
  if (rowScores.length > 0) {
    rowScores.sort((a, b) => b.score - a.score);
    if (rowScores[0].score >= 1) { // At least one keyword match or all cells filled
      return rowScores[0].index;
    }
  }
  
  // Fallback: look for formatted header-like rows (e.g., all cells are strings)
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || isEmptyRow(row)) continue;
    
    if (row.length >= 3 && row.every(cell => typeof cell === 'string' || typeof cell === 'number')) {
      return i;
    }
  }
  
  // If no clear header is found, return -1 to indicate we need a different approach
  return -1;
};

// Helper function to find column index by trying multiple possible headers with improved logic
const findColumnIndexImproved = (headers: string[], possibleNames: string[]): number => {
  // Try exact matches first
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h === name);
    if (index !== -1) return index;
  }
  
  // Then try case-insensitive exact matches
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    if (index !== -1) return index;
  }
  
  // Then try if header contains any of the names
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  
  // Then try if any keyword is contained within the header
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    for (const name of possibleNames) {
      if (name.length > 3 && header.includes(name.toLowerCase())) {
        return i;
      }
    }
  }
  
  // Try for headers with abbreviations or abbreviated keywords
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    
    // Check for common abbreviations
    if (possibleNames.includes('date') && 
        (header === 'dt' || header === 'dte' || header.includes('date'))) {
      return i;
    }
    
    if (possibleNames.includes('description') && 
        (header === 'desc' || header === 'narr' || header.includes('descr'))) {
      return i;
    }
    
    if (possibleNames.includes('amount') && 
        (header === 'amt' || header === 'val' || header.includes('amnt'))) {
      return i;
    }
  }
  
  return -1;
};

// Detect columns by analyzing data types in the rows without relying on headers
const detectColumnsWithoutHeaders = (rows: any[]): { 
  dateCol: number, 
  descCol: number, 
  amountCol: number,
  creditCol: number,
  debitCol: number
} => {
  const result = {
    dateCol: -1,
    descCol: -1,
    amountCol: -1,
    creditCol: -1,
    debitCol: -1
  };
  
  if (rows.length < 3) return result; // Need at least a few rows to analyze
  
  // Skip the first row in case it's a title row and analyze the next 5 rows
  const startRow = 1;
  const rowsToAnalyze = Math.min(5, rows.length - startRow);
  
  // Track column characteristics across rows
  const datePatternMatches: number[] = [];
  const stringLengths: number[][] = [];
  const numericValues: boolean[][] = [];
  const positiveNumbers: boolean[][] = [];
  const negativeNumbers: boolean[][] = [];
  const allColumnTypes: string[][] = [];
  
  for (let rowIdx = startRow; rowIdx < startRow + rowsToAnalyze; rowIdx++) {
    const row = rows[rowIdx];
    if (!row || !Array.isArray(row)) continue;
    
    // Initialize arrays for this row if needed
    if (stringLengths.length <= rowIdx - startRow) {
      stringLengths.push(new Array(row.length).fill(0));
      numericValues.push(new Array(row.length).fill(false));
      positiveNumbers.push(new Array(row.length).fill(false));
      negativeNumbers.push(new Array(row.length).fill(false));
      allColumnTypes.push(new Array(row.length).fill('unknown'));
    }
    
    // Analyze each column in this row
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const value = row[colIdx];
      const valueStr = String(value || '');
      
      // Check for date patterns
      if (looksLikeDate(value)) {
        if (!datePatternMatches.includes(colIdx)) {
          datePatternMatches.push(colIdx);
        }
      }
      
      // Track string lengths for description columns
      if (typeof value === 'string' && !looksLikeDate(value) && !looksLikeNumber(value)) {
        stringLengths[rowIdx - startRow][colIdx] = valueStr.length;
        allColumnTypes[rowIdx - startRow][colIdx] = 'string';
      }
      
      // Track numeric properties for amount columns
      if (looksLikeNumber(value)) {
        numericValues[rowIdx - startRow][colIdx] = true;
        allColumnTypes[rowIdx - startRow][colIdx] = 'number';
        
        const num = parseAmount(value);
        if (num > 0) {
          positiveNumbers[rowIdx - startRow][colIdx] = true;
        } else if (num < 0) {
          negativeNumbers[rowIdx - startRow][colIdx] = true;
        }
      }
    }
  }
  
  // Determine date column
  if (datePatternMatches.length > 0) {
    result.dateCol = datePatternMatches[0]; // Use the first date-like column
  }
  
  // Determine description column - look for columns with consistently long strings
  const avgStringLengths: {colIdx: number, avgLength: number}[] = [];
  
  // Calculate average string length for each column
  for (let colIdx = 0; colIdx < stringLengths[0]?.length || 0; colIdx++) {
    let totalLength = 0;
    let count = 0;
    
    for (let rowIdx = 0; rowIdx < stringLengths.length; rowIdx++) {
      if (stringLengths[rowIdx][colIdx] > 0) {
        totalLength += stringLengths[rowIdx][colIdx];
        count++;
      }
    }
    
    if (count > 0) {
      avgStringLengths.push({
        colIdx,
        avgLength: totalLength / count
      });
    }
  }
  
  // Find the column with the longest average string length (likely description)
  avgStringLengths.sort((a, b) => b.avgLength - a.avgLength);
  if (avgStringLengths.length > 0 && avgStringLengths[0].avgLength > 5) {
    result.descCol = avgStringLengths[0].colIdx;
  }
  
  // Analyze numeric columns for amount, debit, credit
  const numericColumnStats: {
    colIdx: number, 
    numericCount: number,
    positiveCount: number,
    negativeCount: number
  }[] = [];
  
  // Calculate stats for each potential numeric column
  for (let colIdx = 0; colIdx < numericValues[0]?.length || 0; colIdx++) {
    let numericCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (let rowIdx = 0; rowIdx < numericValues.length; rowIdx++) {
      if (numericValues[rowIdx][colIdx]) {
        numericCount++;
        if (positiveNumbers[rowIdx][colIdx]) positiveCount++;
        if (negativeNumbers[rowIdx][colIdx]) negativeCount++;
      }
    }
    
    if (numericCount > 0) {
      numericColumnStats.push({
        colIdx,
        numericCount,
        positiveCount,
        negativeCount
      });
    }
  }
  
  // Sort by count of numeric values (most numeric first)
  numericColumnStats.sort((a, b) => b.numericCount - a.numericCount);
  
  // Find amount or debit/credit columns
  if (numericColumnStats.length > 0) {
    for (const stat of numericColumnStats) {
      // Skip if this is the date column
      if (stat.colIdx === result.dateCol) continue;
      
      // If column has both positive and negative numbers, it's likely an amount column
      if (stat.positiveCount > 0 && stat.negativeCount > 0) {
        result.amountCol = stat.colIdx;
        break;
      }
      
      // If we have separate positive and negative columns
      if (stat.positiveCount > 0 && stat.negativeCount === 0 && result.creditCol === -1) {
        result.creditCol = stat.colIdx;
      } else if (stat.negativeCount > 0 && stat.positiveCount === 0 && result.debitCol === -1) {
        result.debitCol = stat.colIdx;
      }
    }
    
    // If we found neither, use the most numeric column as the amount
    if (result.amountCol === -1 && result.creditCol === -1 && result.debitCol === -1 && numericColumnStats.length > 0) {
      result.amountCol = numericColumnStats[0].colIdx;
    }
  }
  
  return result;
};

// Extract transactions without using header row
const extractTransactionsWithoutHeaders = (rows: any[], columns: { 
  dateCol: number, 
  descCol: number, 
  amountCol: number,
  creditCol: number,
  debitCol: number
}): ParsedTransaction[] => {
  const transactions: ParsedTransaction[] = [];
  const startRow = 1; // Skip the first row, which likely contains headers or title
  
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || isEmptyRow(row)) continue;
    
    try {
      // Ensure we have minimum column indices
      if (columns.dateCol === -1 || columns.descCol === -1 || 
          (columns.amountCol === -1 && columns.creditCol === -1 && columns.debitCol === -1)) {
        continue;
      }
      
      // Parse date
      let dateValue = row[columns.dateCol];
      let date = parseExcelDate(dateValue);
      
      if (!date || isNaN(date.getTime())) {
        continue;
      }
      
      // Parse description
      const description = String(row[columns.descCol] || '').trim();
      if (!description) continue;
      
      // Parse amount
      let amount: number = 0;
      let type: 'debit' | 'credit' = 'debit';
      
      if (columns.amountCol !== -1) {
        // Single amount column
        const amountValue = row[columns.amountCol];
        const result = parseAmountWithType(amountValue);
        amount = result.amount;
        type = result.type;
      } else {
        // Separate debit and credit columns
        const debitValue = columns.debitCol !== -1 ? row[columns.debitCol] : null;
        const creditValue = columns.creditCol !== -1 ? row[columns.creditCol] : null;
        
        const debitAmount = debitValue !== null ? parseAmount(debitValue) : 0;
        const creditAmount = creditValue !== null ? parseAmount(creditValue) : 0;
        
        if (debitAmount > 0) {
          amount = debitAmount;
          type = 'debit';
        } else if (creditAmount > 0) {
          amount = creditAmount;
          type = 'credit';
        } else {
          // Skip rows with no amount information
          continue;
        }
      }
      
      if (isNaN(amount) || amount === 0) {
        continue;
      }
      
      transactions.push({
        id: `trans-${i}`,
        date,
        description,
        amount,
        type,
        selected: type === 'debit',
      });
    } catch (err) {
      console.warn('Error parsing row without headers:', err, row);
      // Continue to the next row
    }
  }
  
  return transactions;
};

// Helper function to detect columns by analyzing data types
const detectColumnsByDataType = (rows: any[], headerRowIndex: number): { 
  dateCol: number, 
  descCol: number, 
  amountCol: number,
  creditCol: number,
  debitCol: number
} => {
  const startRow = headerRowIndex + 1;
  const result = {
    dateCol: -1,
    descCol: -1,
    amountCol: -1,
    creditCol: -1,
    debitCol: -1
  };
  
  if (startRow >= rows.length) return result;
  
  // Analyze data rows to identify column types
  const dateCandidates: number[] = [];
  const textColumns: { [key: number]: number } = {}; // Column index -> total text length
  const numericColumns: { [key: number]: { positive: number, negative: number } } = {};
  
  // Use multiple rows to increase detection accuracy
  const rowsToCheck = Math.min(startRow + 5, rows.length);
  
  for (let rowIdx = startRow; rowIdx < rowsToCheck; rowIdx++) {
    const row = rows[rowIdx];
    if (!row || !Array.isArray(row) || isEmptyRow(row)) continue;
    
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const value = row[colIdx];
      
      // Check for date-like values
      if (looksLikeDate(value)) {
        if (!dateCandidates.includes(colIdx)) {
          dateCandidates.push(colIdx);
        }
        continue;
      }
      
      // Check for text columns that might be descriptions
      if (typeof value === 'string' && !looksLikeNumber(value)) {
        textColumns[colIdx] = (textColumns[colIdx] || 0) + String(value).length;
      }
      
      // Check for numeric columns that might be amounts
      if (looksLikeNumber(value)) {
        if (!numericColumns[colIdx]) {
          numericColumns[colIdx] = { positive: 0, negative: 0 };
        }
        
        const num = parseAmount(value);
        if (num > 0) {
          numericColumns[colIdx].positive++;
        } else if (num < 0) {
          numericColumns[colIdx].negative++;
        }
      }
    }
  }
  
  // Determine date column
  if (dateCandidates.length > 0) {
    result.dateCol = dateCandidates[0]; // Use the first date-like column
  }
  
  // Determine description column - find column with longest text
  let maxTextLength = 0;
  for (const colIdx in textColumns) {
    if (textColumns[colIdx] > maxTextLength) {
      maxTextLength = textColumns[colIdx];
      result.descCol = parseInt(colIdx);
    }
  }
  
  // Analyze numeric columns to find amount, debit or credit columns
  const numericCols = Object.keys(numericColumns).map(colIdx => ({
    colIdx: parseInt(colIdx),
    ...numericColumns[parseInt(colIdx)]
  }));
  
  // Sort by total count of numeric values
  numericCols.sort((a, b) => 
    (b.positive + b.negative) - (a.positive + a.negative)
  );
  
  for (const col of numericCols) {
    // Skip if this is the date column or description column
    if (col.colIdx === result.dateCol || col.colIdx === result.descCol) {
      continue;
    }
    
    // If the column has both positive and negative values, it's likely the amount column
    if (col.positive > 0 && col.negative > 0) {
      result.amountCol = col.colIdx;
      break;
    }
    
    // If we haven't found a credit column and this has mostly positive values
    if (result.creditCol === -1 && col.positive > 0 && col.negative === 0) {
      result.creditCol = col.colIdx;
    }
    
    // If we haven't found a debit column and this has mostly negative values
    if (result.debitCol === -1 && col.negative > 0 && col.positive === 0) {
      result.debitCol = col.colIdx;
    }
  }
  
  // If we didn't find an amount column but found either credit or debit, that's good enough
  if (result.amountCol === -1 && (result.creditCol !== -1 || result.debitCol !== -1)) {
    // We're good, we found separate columns
  } 
  // If we didn't find any specific amount columns, use the first numeric column
  else if (result.amountCol === -1 && result.creditCol === -1 && result.debitCol === -1 && numericCols.length > 0) {
    result.amountCol = numericCols[0].colIdx;
  }
  
  return result;
};

// Helper function to check if a value looks like a date
const looksLikeDate = (value: any): boolean => {
  if (!value) return false;
  
  // Check if it's already a Date object
  if (value instanceof Date) return true;
  
  // Check if it's a number that might be an Excel date
  if (typeof value === 'number' && value > 30000 && value < 50000) return true;
  
  // Check if it's a string that might be a date
  if (typeof value === 'string') {
    // Check for common date patterns
    const datePatterns = [
      /\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}/,  // yyyy-mm-dd, dd/mm/yyyy, etc.
      /\d{1,2}[-\/\s][A-Za-z]{3,}[-\/\s]\d{2,4}/, // 01 Jan 2022, etc.
      /[A-Za-z]{3,}[\s-\/]\d{1,2}[\s-\/]\d{2,4}/, // Jan 01 2022, etc.
    ];
    
    for (const pattern of datePatterns) {
      if (pattern.test(value)) return true;
    }
    
    // Try with Date.parse as last resort
    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) return true;
  }
  
  return false;
};

// Helper function to check if a value looks like a number
const looksLikeNumber = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  // If it's already a number, return true
  if (typeof value === 'number') return true;
  
  // If it's a string, check if it can be parsed as a number
  if (typeof value === 'string') {
    // Remove currency symbols, commas, parentheses, and spaces
    const cleaned = value.replace(/[₦$€£,\s\(\)]/g, '');
    
    // Check if what's left is a valid number
    return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
  }
  
  return false;
};

// Helper function to parse Excel dates
const parseExcelDate = (dateValue: any, XLSX?: any): Date | null => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a number, it might be an Excel date (days since 1900-01-01)
  if (typeof dateValue === 'number') {
    // Excel date calculation
    const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date;
  }
  
  // If it's a string, try parsing it
  if (typeof dateValue === 'string') {
    // Try parsing with various formats
    const formats = [
      // Direct parsing
      (v: string) => new Date(v),
      
      // MM/DD/YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return match ? new Date(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`) : null;
      },
      
      // DD/MM/YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // MM-DD-YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        return match ? new Date(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`) : null;
      },
      
      // DD-MM-YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // DD.MM.YYYY
      (v: string) => {
        const match = v.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        return match ? new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`) : null;
      },
      
      // Text month formats: 01 Jan 2022
      (v: string) => {
        const match = v.match(/(\d{1,2})[\s-]([A-Za-z]{3,})[\s-](\d{2,4})/);
        if (!match) return null;
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(match[2].toLowerCase().substring(0, 3)) + 1;
        if (month === 0) return null;
        return new Date(`${match[3].length === 2 ? '20' + match[3] : match[3]}-${month.toString().padStart(2, '0')}-${match[1].padStart(2, '0')}`);
      },
      
      // Text month formats: Jan 01 2022
      (v: string) => {
        const match = v.match(/([A-Za-z]{3,})[\s-](\d{1,2})[\s-](\d{2,4})/);
        if (!match) return null;
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(match[1].toLowerCase().substring(0, 3)) + 1;
        if (month === 0) return null;
        return new Date(`${match[3].length === 2 ? '20' + match[3] : match[3]}-${month.toString().padStart(2, '0')}-${match[2].padStart(2, '0')}`);
      }
    ];
    
    for (const format of formats) {
      try {
        const date = format(dateValue);
        if (date && !isNaN(date.getTime())) return date;
      } catch (e) {
        // Try next format
      }
    }
  }
  
  // If using XLSX, try getting the date from the XLSX library
  if (XLSX && typeof XLSX.SSF !== 'undefined') {
    try {
      // This is an advanced method using the XLSX library if available
      const excelDate = XLSX.SSF.parse_date_code(dateValue);
      if (excelDate) {
        const date = new Date(
          excelDate.y, 
          excelDate.m - 1, 
          excelDate.d, 
          excelDate.H || 0, 
          excelDate.M || 0, 
          excelDate.S || 0
        );
        if (!isNaN(date.getTime())) return date;
      }
    } catch (e) {
      // Fall through to return null
    }
  }
  
  return null;
};

// Helper function to parse amount values
const parseAmount = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  // Handle number type directly
  if (typeof value === 'number') return value;
  
  // Convert to string for processing
  const strValue = String(value);
  
  // Check if amount has parentheses which often indicates negative numbers: (100.00)
  const isNegative = strValue.includes('(') && strValue.includes(')');
  
  // Remove currency symbols, commas, spaces, and parentheses
  let cleaned = strValue.replace(/[₦$€£,\s\(\)]/g, '');
  
  // Handle explicit negative sign
  const hasNegativeSign = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');
  
  // Parse the numeric value
  const amount = parseFloat(cleaned);
  
  // Apply negative sign if needed
  if (isNaN(amount)) return 0;
  if (isNegative || hasNegativeSign) return -Math.abs(amount);
  return amount;
};

// Parse amount and determine type (debit/credit)
const parseAmountWithType = (value: any): { amount: number, type: 'debit' | 'credit' } => {
  if (value === null || value === undefined || value === '') {
    return { amount: 0, type: 'debit' };
  }
  
  // Handle number type directly
  if (typeof value === 'number') {
    return { 
      amount: Math.abs(value), 
      type: value < 0 ? 'debit' : 'credit' 
    };
  }
  
  // Convert to string for processing
  const strValue = String(value);
  
  // Check for patterns that indicate negative amount (debit)
  const isNegative = 
    strValue.includes('(') && strValue.includes(')') || // Parentheses: (100.00)
    strValue.startsWith('-') || // Leading minus: -100.00
    strValue.includes('DR') || strValue.includes('Dr') || strValue.includes('dr'); // DR indicator
  
  // Remove currency symbols, commas, parentheses, and spaces
  let cleaned = strValue.replace(/[₦$€£,\s\(\)]/g, '');
  
  // Remove DR/CR indicators for parsing
  cleaned = cleaned.replace(/\b(DR|Dr|dr|CR|Cr|cr)\b/g, '');
  
  // Handle explicit negative sign
  cleaned = cleaned.replace(/-/g, '');
  
  // Parse the numeric value
  const amount = parseFloat(cleaned);
  
  if (isNaN(amount)) return { amount: 0, type: 'debit' };
  
  // Determine type based on indicators or sign
  let type: 'debit' | 'credit' = 'credit';
  
  if (isNegative || 
      strValue.includes('DR') || strValue.includes('Dr') || strValue.includes('dr') ||
      strValue.includes('DEBIT') || strValue.includes('Debit') || strValue.includes('debit')) {
    type = 'debit';
  } else if (strValue.includes('CR') || strValue.includes('Cr') || strValue.includes('cr') ||
             strValue.includes('CREDIT') || strValue.includes('Credit') || strValue.includes('credit')) {
    type = 'credit';
  }
  
  return { amount: Math.abs(amount), type };
};
