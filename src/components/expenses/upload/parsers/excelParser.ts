
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
      
      // Try to detect header row
      const headers = (rows[0] as string[]).map(h => String(h).trim().toLowerCase());
      const dateColIndex = headers.findIndex(h => h.includes('date'));
      const descColIndex = headers.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('details'));
      const amountColIndex = headers.findIndex(h => h.includes('amount') || h.includes('value'));
      
      if (dateColIndex === -1 || descColIndex === -1 || amountColIndex === -1) {
        console.error('Could not identify required columns in Excel', headers);
        onError('Could not identify the date, description, and amount columns in your Excel file.');
        return;
      }
      
      const transactions: ParsedTransaction[] = [];
      
      // Process each row (skipping header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row || row.length === 0) continue;
        
        // Skip rows with insufficient data
        if (row.length <= Math.max(dateColIndex, descColIndex, amountColIndex)) {
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
            date = new Date(dateValue);
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
          let amountStr = String(row[amountColIndex] || '0');
          let amount: number;
          
          // Check if amount has parentheses which often indicates negative numbers: (100.00)
          const isNegative = amountStr.includes('(') && amountStr.includes(')');
          
          if (isNegative) {
            amountStr = amountStr.replace(/[()₦,"']/g, '').trim();
            amount = Math.abs(parseFloat(amountStr));
          } else {
            amountStr = amountStr.replace(/[₦,"']/g, '').trim();
            amount = Math.abs(parseFloat(amountStr));
          }
          
          if (isNaN(amount)) {
            console.warn('Could not parse amount:', row[amountColIndex]);
            continue;
          }
          
          // Determine transaction type - negative or in parentheses usually means debit
          const type = (String(row[amountColIndex]).startsWith('-') || isNegative) ? 'debit' : 'credit';
          
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
