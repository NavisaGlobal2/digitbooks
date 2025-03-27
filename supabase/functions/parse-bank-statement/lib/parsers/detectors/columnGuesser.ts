
// Helper function to guess description and amount columns based on the date column
import { parseAmount } from '../utils/amountUtils.ts';

export function guessColumnsFromSample(rows: any[], headerRowIndex: number, dateIndex: number): { 
  descIdx: number, 
  amtIdx: number, 
  creditIdx: number, 
  debitIdx: number 
} {
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
