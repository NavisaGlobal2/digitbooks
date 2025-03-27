
import { parseAmount } from '../helpers.ts';

// New function to guess columns by analyzing data types in the rows
export function guessColumnsByDataType(rows: any[], headerRowIndex: number): { 
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

// Simple function to ensure we have date parsing functionality
// We'll import the full version, but need this for TypeScript checking
function parseDate(dateStr: string): Date | null {
  // This is just a placeholder - we'll import the real parseDate from helpers.ts
  return new Date(dateStr);
}
