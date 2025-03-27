
import { ParsedTransaction } from "./types";
import { parseAmount } from "./helpers";

export const parseCSVFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const csvContent = e.target?.result as string;
      if (!csvContent) {
        onError('Could not read CSV file');
        return;
      }
      
      // Split content into rows, supporting different newline formats
      let rows = csvContent.split(/\r\n|\n|\r/);
      
      // Remove empty rows
      rows = rows.filter(row => row.trim().length > 0);
      
      if (rows.length <= 1) {
        onError('The CSV file does not contain enough data.');
        return;
      }
      
      console.log('CSV first few rows:', rows.slice(0, 3));
      
      // Detect delimiter (comma, semicolon, tab)
      const delimiter = detectDelimiter(rows[0]);
      
      // Parse rows into arrays
      const parsedRows = rows.map(row => {
        // Handle quoted values with delimiters inside them
        const matches = [];
        let inQuote = false;
        let currentValue = '';
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
            inQuote = !inQuote;
          } else if (char === delimiter && !inQuote) {
            matches.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        matches.push(currentValue);
        
        // Clean up the values (remove quotes and trim)
        return matches.map(value => {
          let cleanValue = value.trim();
          if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
            cleanValue = cleanValue.substring(1, cleanValue.length - 1);
          }
          return cleanValue;
        });
      });
      
      // Find the header row (might not always be the first row)
      let headerRowIndex = findHeaderRow(parsedRows);
      if (headerRowIndex === -1) {
        console.error('Could not identify a header row in CSV file');
        onError('Could not identify column headers in your CSV file. Please ensure your file has headers for date, description/narrative, and amount columns.');
        return;
      }
      
      const headers = parsedRows[headerRowIndex].map(h => String(h).trim().toLowerCase());
      console.log('Detected CSV headers:', headers);
      
      // Find relevant column indices with expanded options
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
          onError('Could not identify the date, description, and amount columns in your CSV file. Please try a different format or check our supported bank templates.');
          return;
        }
      }
      
      if (dateColIndex === -1 || descColIndex === -1) {
        console.error('Could not identify required columns in CSV', headers);
        onError('Could not identify the date, description, and amount columns in your CSV file. Please try a different format or check our supported bank templates.');
        return;
      }
      
      // Parse the data into transactions
      const transactions: ParsedTransaction[] = [];
      
      // Process each row (skipping the header)
      for (let i = headerRowIndex + 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (!row || row.length === 0) continue;
        
        // Skip rows with insufficient data
        if (row.length <= Math.max(dateColIndex, descColIndex, amountColIndex, creditColIndex, debitColIndex)) {
          continue;
        }
        
        try {
          // Parse date
          const dateValue = row[dateColIndex];
          
          if (!dateValue) {
            console.warn('Missing date value in row:', i);
            continue;
          }
          
          const date = parseDate(dateValue);
          
          if (isNaN(date.getTime())) {
            console.warn('Could not parse date:', dateValue);
            continue;
          }
          
          // Parse description
          const description = row[descColIndex]?.trim() || '';
          if (!description) continue;
          
          // Parse amount
          let amount: number = 0;
          let type: 'debit' | 'credit' = 'debit';
          
          if (amountColIndex !== -1) {
            // Single amount column
            let amountStr = row[amountColIndex] || '0';
            
            // Check if amount has parentheses which often indicates negative numbers: (100.00)
            const isNegative = amountStr.includes('(') && amountStr.includes(')');
            
            if (isNegative) {
              amountStr = amountStr.replace(/[()₦,"']/g, '').trim();
              amount = Math.abs(parseFloat(amountStr));
              type = 'debit';
            } else {
              amountStr = amountStr.replace(/[₦,"']/g, '').trim();
              amount = parseFloat(amountStr) || 0;
              
              // If there's a sign in the column, use it to determine the type
              type = amountStr.startsWith('-') ? 'debit' : 'credit';
              
              // Make sure amount is positive
              amount = Math.abs(amount);
            }
          } else {
            // Separate debit and credit columns
            const debitValue = debitColIndex !== -1 ? row[debitColIndex] || '0' : '0';
            const creditValue = creditColIndex !== -1 ? row[creditColIndex] || '0' : '0';
            
            const debitAmount = parseAmount(debitValue) || 0;
            const creditAmount = parseAmount(creditValue) || 0;
            
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
            console.warn('Invalid amount:', row[amountColIndex]);
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
        onError('No valid transactions found in the CSV file. Please check the format.');
      } else {
        console.log('Successfully parsed', transactions.length, 'transactions from CSV');
        onComplete(transactions);
      }
    } catch (err) {
      console.error('Error parsing CSV file:', err);
      onError('Failed to parse the CSV file. Please check the format and try again.');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read the CSV file');
  };
  
  reader.readAsText(file);
};

// Helper function to detect the delimiter used in the CSV
const detectDelimiter = (firstRow: string): string => {
  const counts = {
    ',': (firstRow.match(/,/g) || []).length,
    ';': (firstRow.match(/;/g) || []).length,
    '\t': (firstRow.match(/\t/g) || []).length,
    '|': (firstRow.match(/\|/g) || []).length,
  };
  
  const max = Math.max(...Object.values(counts));
  
  // If no delimiter is found or too few, default to comma
  if (max < 2) return ',';
  
  // Return the most frequently occurring delimiter
  return Object.keys(counts).find(key => counts[key as keyof typeof counts] === max) || ',';
};

// Helper function to find the likely header row
const findHeaderRow = (rows: string[][]): number => {
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
  // Clean the string
  dateStr = dateStr.trim().replace(/"|'/g, '');
  
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

