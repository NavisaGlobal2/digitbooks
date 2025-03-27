
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
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rows.length <= 1) {
        onError('The Excel file does not contain enough data.');
        return;
      }
      
      console.log('Excel rows detected:', rows.slice(0, 3));
      
      // Try to detect header row - check first 5 rows to find the most likely header
      let headerRowIndex = findHeaderRow(rows);
      if (headerRowIndex === -1) {
        console.error('Could not identify a header row in Excel file');
        onError('Could not identify column headers in your Excel file. Please ensure your file has headers for date, description/narrative, and amount columns.');
        return;
      }
      
      const headers = (rows[headerRowIndex] as string[]).map(h => String(h).trim().toLowerCase());
      console.log('Detected headers:', headers);
      
      // More flexible header detection
      const dateColIndex = findColumnIndex(headers, [
        'date', 'transaction date', 'txn date', 'value date', 'posting date', 'trans date', 'entry date'
      ]);
      
      const descColIndex = findColumnIndex(headers, [
        'description', 'desc', 'narrative', 'details', 'transaction description', 
        'particulars', 'narration', 'transaction narration', 'remarks', 'trans desc'
      ]);
      
      const amountColIndex = findColumnIndex(headers, [
        'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
        'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal'
      ]);
      
      // Try to find separate debit and credit columns if amount column is not found
      let creditColIndex = -1;
      let debitColIndex = -1;
      
      if (amountColIndex === -1) {
        creditColIndex = findColumnIndex(headers, ['credit', 'deposit', 'cr', 'credit amount']);
        debitColIndex = findColumnIndex(headers, ['debit', 'withdrawal', 'dr', 'debit amount']);
        
        if (creditColIndex === -1 && debitColIndex === -1) {
          console.error('Could not identify amount columns', headers);
          onError('Could not identify the date, description, and amount columns in your Excel file. Please try a different format or check our supported bank templates.');
          return;
        }
      }
      
      if (dateColIndex === -1 || descColIndex === -1) {
        console.error('Could not identify required columns in Excel', headers);
        onError('Could not identify the date, description, and amount columns in your Excel file. Please try a different format or check our supported bank templates.');
        return;
      }
      
      const transactions: ParsedTransaction[] = [];
      
      // Process each row (skipping header)
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row || row.length === 0) continue;
        
        // Skip rows with insufficient data
        if (row.length <= Math.max(dateColIndex, descColIndex, amountColIndex, creditColIndex, debitColIndex)) {
          continue;
        }
        
        try {
          // Parse date - try Excel date first, then string format
          let dateValue = row[dateColIndex];
          let date: Date;
          
          if (typeof dateValue === 'number') {
            // Excel stores dates as numbers (days since 1900-01-01)
            date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
          } else if (typeof dateValue === 'string') {
            // Try various date formats
            date = parseDate(dateValue);
          } else if (dateValue instanceof Date) {
            date = dateValue;
          } else {
            console.warn('Unrecognized date format:', dateValue);
            continue;
          }
          
          if (isNaN(date.getTime())) {
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
            let amountStr = String(row[amountColIndex] || '0');
            
            // Check if amount has parentheses which often indicates negative numbers: (100.00)
            const isNegative = amountStr.includes('(') && amountStr.includes(')');
            
            if (isNegative) {
              amountStr = amountStr.replace(/[()₦,"']/g, '').trim();
              amount = Math.abs(parseFloat(amountStr));
              type = 'debit';
            } else {
              amountStr = amountStr.replace(/[₦,"']/g, '').trim();
              amount = Math.abs(parseFloat(amountStr));
              
              // If there's a sign in the column, use it to determine the type
              type = amountStr.startsWith('-') ? 'debit' : 'credit';
            }
          } else {
            // Separate debit and credit columns
            const debitValue = debitColIndex !== -1 ? String(row[debitColIndex] || '0') : '0';
            const creditValue = creditColIndex !== -1 ? String(row[creditColIndex] || '0') : '0';
            
            const debitAmount = parseFloat(debitValue.replace(/[₦,"']/g, '').trim()) || 0;
            const creditAmount = parseFloat(creditValue.replace(/[₦,"']/g, '').trim()) || 0;
            
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
          
          if (isNaN(amount)) {
            console.warn('Could not parse amount:', row[amountColIndex]);
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

// Helper function to find the likely header row
const findHeaderRow = (rows: any[]): number => {
  // Common header keywords to look for
  const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance'];
  
  // Check the first 5 rows (or fewer if file is smaller)
  const rowsToCheck = Math.min(5, rows.length);
  
  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    
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
};

// Helper function to find column index by trying multiple possible headers
const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
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
};

// Helper function to parse dates in various formats
const parseDate = (dateStr: string): Date => {
  // Try direct parsing first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try common formats
  const formats = [
    // MM/DD/YYYY
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, fn: (m: string[]) => new Date(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`) },
    // DD/MM/YYYY
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, fn: (m: string[]) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
    // MM-DD-YYYY
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, fn: (m: string[]) => new Date(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`) },
    // DD-MM-YYYY
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, fn: (m: string[]) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
    // DD.MM.YYYY
    { regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, fn: (m: string[]) => new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`) },
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      const parsedDate = format.fn(match);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
  }
  
  // If all fails, return the original parse result (will likely be invalid)
  return date;
};

