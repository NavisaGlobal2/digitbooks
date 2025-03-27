
// Helper functions to analyze data types and guess column roles
import { isDateLike, looksLikeNumber } from '../utils/typeDetectionUtils.ts';

// Analyze column data types to improve detection
export function guessColumnsByDataType(rows: any[], headerRowIndex: number): { 
  dateIndex: number, 
  descIndex: number, 
  amountIndex: number,
  creditIndex: number, 
  debitIndex: number 
} {
  const result = { 
    dateIndex: -1, 
    descIndex: -1, 
    amountIndex: -1, 
    creditIndex: -1, 
    debitIndex: -1 
  };
  
  const startRow = headerRowIndex + 1;
  
  if (startRow >= rows.length) return result;
  
  // Try to recognize columns by their data types
  const maxRows = Math.min(5, rows.length - startRow);
  
  // These will track characteristics of each column
  const datePatterns: number[] = [];
  const stringLengths: { [key: number]: number } = {};
  const numericCounts: { [key: number]: number } = {};
  const positiveCounts: { [key: number]: number } = {};
  const negativeCounts: { [key: number]: number } = {};
  
  // Scan sample rows to identify patterns
  for (let i = 0; i < maxRows; i++) {
    const rowIdx = startRow + i;
    const row = rows[rowIdx];
    
    if (!row || !Array.isArray(row)) continue;
    
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const value = row[colIdx];
      const valueStr = String(value || '');
      
      // Check for date patterns
      if (isDateLike(value)) {
        if (!datePatterns.includes(colIdx)) {
          datePatterns.push(colIdx);
        }
      } 
      
      // Check for description patterns - usually longer text strings
      else if (typeof value === 'string' && !looksLikeNumber(valueStr)) {
        stringLengths[colIdx] = (stringLengths[colIdx] || 0) + valueStr.length;
      }
      
      // Check for amount patterns - usually numbers
      else if (looksLikeNumber(valueStr)) {
        numericCounts[colIdx] = (numericCounts[colIdx] || 0) + 1;
        
        const numValue = parseFloat(valueStr.replace(/[^\d.-]/g, ''));
        if (!isNaN(numValue)) {
          if (numValue > 0) {
            positiveCounts[colIdx] = (positiveCounts[colIdx] || 0) + 1;
          } else if (numValue < 0) {
            negativeCounts[colIdx] = (negativeCounts[colIdx] || 0) + 1;
          }
        }
      }
    }
  }
  
  // Decide on date column
  if (datePatterns.length > 0) {
    result.dateIndex = datePatterns[0]; // First detected date column
  }
  
  // Decide on description column - look for longest text strings
  let maxLength = 0;
  for (const colIdx in stringLengths) {
    if (stringLengths[colIdx] > maxLength) {
      maxLength = stringLengths[colIdx];
      result.descIndex = parseInt(colIdx);
    }
  }
  
  // Decide on amount columns
  // First, check for columns with both positive and negative values (likely the main amount column)
  for (const colIdx in numericCounts) {
    const positive = positiveCounts[colIdx] || 0;
    const negative = negativeCounts[colIdx] || 0;
    
    const colIdxNum = parseInt(colIdx);
    
    // Skip columns we've already identified as date or description
    if (colIdxNum === result.dateIndex || colIdxNum === result.descIndex) {
      continue;
    }
    
    // Column with both positive and negative is likely the main amount column
    if (positive > 0 && negative > 0) {
      result.amountIndex = colIdxNum;
      break;
    }
  }
  
  // If we didn't find a mixed amount column, look for separate credit and debit columns
  if (result.amountIndex === -1) {
    // Look for predominantly positive and negative columns
    let bestPositiveCol = -1;
    let bestNegativeCol = -1;
    let maxPositive = 0;
    let maxNegative = 0;
    
    for (const colIdx in numericCounts) {
      const colIdxNum = parseInt(colIdx);
      
      // Skip columns we've already identified as date or description
      if (colIdxNum === result.dateIndex || colIdxNum === result.descIndex) {
        continue;
      }
      
      const positive = positiveCounts[colIdx] || 0;
      const negative = negativeCounts[colIdx] || 0;
      
      // Good candidate for credit column (mostly positive values)
      if (positive > maxPositive && positive > negative) {
        maxPositive = positive;
        bestPositiveCol = colIdxNum;
      }
      
      // Good candidate for debit column (mostly negative values)
      if (negative > maxNegative && negative > positive) {
        maxNegative = negative;
        bestNegativeCol = colIdxNum;
      }
    }
    
    if (bestPositiveCol !== -1) result.creditIndex = bestPositiveCol;
    if (bestNegativeCol !== -1) result.debitIndex = bestNegativeCol;
  }
  
  // If we still don't have any amount columns, just pick the first numeric column
  if (result.amountIndex === -1 && result.creditIndex === -1 && result.debitIndex === -1) {
    for (const colIdx in numericCounts) {
      const colIdxNum = parseInt(colIdx);
      
      // Skip columns we've already identified as date or description
      if (colIdxNum === result.dateIndex || colIdxNum === result.descIndex) {
        continue;
      }
      
      result.amountIndex = colIdxNum;
      break;
    }
  }
  
  return result;
}
