
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from './types';
import { parseRowsWithMapping, ColumnMapping, extractHeadersAndData } from './columnMapper';

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  headers: string[];
  rows: string[][];
  hasHeader: boolean;
}

/**
 * Parse a CSV file into usable transaction data
 */
export const parseCSVFile = (
  file: File,
  onSuccess: (result: CSVParseResult) => void,
  onError: (errorMessage: string) => void,
  columnMapping?: ColumnMapping
) => {
  Papa.parse(file, {
    complete: (results) => {
      try {
        if (!results.data || results.data.length === 0) {
          throw new Error('No data found in the CSV file');
        }
        
        // Filter out empty rows
        const rows = results.data.filter((row: any[]) => 
          row.length > 1 && row.some(cell => cell && cell.toString().trim() !== '')
        ) as string[][];
        
        if (rows.length === 0) {
          throw new Error('No usable data found in the CSV file');
        }
        
        const { headers, sampleData, hasHeader } = extractHeadersAndData(rows);
        
        // If column mapping is provided, use it to parse the rows
        if (columnMapping) {
          const transactions = parseRowsWithMapping(rows, columnMapping, hasHeader);
          
          onSuccess({
            transactions,
            headers,
            rows,
            hasHeader
          });
        } else {
          // Just return headers and data for mapping UI
          onSuccess({
            transactions: [],
            headers,
            rows,
            hasHeader
          });
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        onError(error instanceof Error ? error.message : 'Failed to parse CSV file');
      }
    },
    error: (error) => {
      console.error('CSV parsing error:', error);
      onError(`CSV parsing error: ${error.message}`);
    }
  });
};
