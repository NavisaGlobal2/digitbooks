
import { parseDate } from '../helpers.ts'

// Cleanup and normalize the extracted data
export function cleanupExtractedData(rows: string[][]): string[][] {
  if (rows.length === 0) return rows
  
  // Look for potential header row
  let headerIndex = -1
  const headerKeywords = ['date', 'description', 'amount', 'transaction', 'debit', 'credit', 'balance']
  
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowText = rows[i].join(' ').toLowerCase()
    let matches = 0
    
    for (const keyword of headerKeywords) {
      if (rowText.includes(keyword)) {
        matches++
      }
    }
    
    if (matches >= 2) {
      headerIndex = i
      break
    }
  }
  
  // If a header row was found, ensure all data rows have the same length
  if (headerIndex !== -1) {
    const headerLength = rows[headerIndex].length
    
    // Normalize data rows to have the same column count as the header
    const normalizedRows = [rows[headerIndex]]
    
    for (let i = headerIndex + 1; i < rows.length; i++) {
      // Skip empty rows
      if (rows[i].length === 0) continue
      
      // Skip rows with mostly empty cells
      const nonEmptyCells = rows[i].filter(cell => cell.trim().length > 0).length
      if (nonEmptyCells < 2) continue
      
      // If row has too few columns, pad with empty strings
      if (rows[i].length < headerLength) {
        normalizedRows.push([...rows[i], ...Array(headerLength - rows[i].length).fill('')])
      } 
      // If row has too many columns, truncate
      else if (rows[i].length > headerLength) {
        normalizedRows.push(rows[i].slice(0, headerLength))
      }
      // Row is the right length
      else {
        normalizedRows.push(rows[i])
      }
    }
    
    return normalizedRows
  }
  
  // If no clear header was found, try to normalize the rows
  // by finding the most common row length
  const lengthCounts: { [key: number]: number } = {}
  
  for (const row of rows) {
    if (row.length === 0) continue
    lengthCounts[row.length] = (lengthCounts[row.length] || 0) + 1
  }
  
  let mostCommonLength = 0
  let maxCount = 0
  
  for (const length in lengthCounts) {
    if (lengthCounts[length] > maxCount) {
      maxCount = lengthCounts[length]
      mostCommonLength = parseInt(length)
    }
  }
  
  // Filter to only include rows with the most common length
  // or pad/truncate rows to match that length
  if (mostCommonLength > 0) {
    return rows
      .filter(row => row.length > 0)
      .map(row => {
        if (row.length < mostCommonLength) {
          return [...row, ...Array(mostCommonLength - row.length).fill('')]
        } else if (row.length > mostCommonLength) {
          return row.slice(0, mostCommonLength)
        }
        return row
      })
  }
  
  return rows.filter(row => row.length > 0)
}

// Detect columns by analyzing data types in the rows without relying on headers
export function detectColumnsWithoutHeaders(rows: any[]): { 
  dateCol: number, 
  descCol: number, 
  amountCol: number,
  creditCol: number,
  debitCol: number
} {
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
}

// Extract transactions without using header row
export function extractTransactionsWithoutHeaders(rows: any[], columns: { 
  dateCol: number, 
  descCol: number, 
  amountCol: number,
  creditCol: number,
  debitCol: number
}): any[] {
  const transactions: any[] = [];
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
      let dateObj = parseExcelDate(dateValue);
      
      if (!dateObj || isNaN(dateObj.getTime())) {
        continue;
      }
      
      // Convert Date to ISO string
      const date = dateObj.toISOString();
      
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
}

// Helper function to check if a row is empty
export function isEmptyRow(row: any[]): boolean {
  return row.every(cell => cell === '' || cell === null || cell === undefined);
}

// Helper function to check if a value looks like a date
export function looksLikeDate(value: any): boolean {
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
}

// Helper function to check if a value looks like a number
export function looksLikeNumber(value: any): boolean {
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
}
