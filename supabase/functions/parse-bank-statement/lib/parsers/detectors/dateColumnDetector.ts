
// Helper function to guess which column might contain dates
import { isDateLike } from '../utils/typeDetectionUtils.ts';

export function guessPrimaryDateColumn(rows: any[], headerRowIndex: number): number {
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
      const value = row[colIdx];
      
      // Check if this looks like a date
      if (isDateLike(value)) {
        if (!dateLikeColumns.includes(colIdx)) {
          dateLikeColumns.push(colIdx);
        }
      }
    }
  }
  
  // If we found multiple date-like columns, prefer the first one
  return dateLikeColumns.length > 0 ? dateLikeColumns[0] : -1;
}
