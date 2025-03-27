
import { toast } from "sonner";
import { ParsedTransaction } from "./types";

export const parseCSVFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const contents = e.target?.result as string;
      const lines = contents.split('\n');
      
      if (lines.length <= 1) {
        onError('The CSV file does not contain enough data.');
        return;
      }
      
      // Try to detect header row
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dateColIndex = headers.findIndex(h => h.includes('date'));
      const descColIndex = headers.findIndex(h => h.includes('desc') || h.includes('narration') || h.includes('details'));
      const amountColIndex = headers.findIndex(h => h.includes('amount') || h.includes('value'));
      
      if (dateColIndex === -1 || descColIndex === -1 || amountColIndex === -1) {
        console.error('Could not identify required columns in CSV', headers);
        onError('Could not identify the date, description, and amount columns in your CSV file.');
        return;
      }
      
      const transactions: ParsedTransaction[] = [];
      
      // Process each line (skipping header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle quoted values in CSV properly
        let columns: string[] = [];
        let currentColumn = '';
        let insideQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            columns.push(currentColumn);
            currentColumn = '';
          } else {
            currentColumn += char;
          }
        }
        
        columns.push(currentColumn); // Add the last column
        
        // Skip rows with insufficient data
        if (columns.length <= Math.max(dateColIndex, descColIndex, amountColIndex)) {
          console.warn('Skipping row with insufficient columns', columns);
          continue;
        }
        
        try {
          // Parse date
          let dateStr = columns[dateColIndex].replace(/"/g, '').trim();
          let date: Date;
          
          // Try different date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Try both MM/DD/YYYY and DD/MM/YYYY formats
              date = new Date(dateStr);
              if (isNaN(date.getTime())) {
                // If invalid, try swapping month and day
                const [first, second, year] = parts;
                date = new Date(`${year}-${second}-${first}`);
              }
            } else {
              date = new Date(dateStr);
            }
          } else {
            date = new Date(dateStr);
          }
          
          if (isNaN(date.getTime())) {
            console.warn('Could not parse date:', dateStr);
            continue;
          }
          
          // Parse description
          const description = columns[descColIndex].replace(/"/g, '').trim();
          
          // Parse amount
          let amountStr = columns[amountColIndex].replace(/[₦,"']/g, '').trim();
          const amount = Math.abs(parseFloat(amountStr));
          
          if (isNaN(amount)) {
            console.warn('Could not parse amount:', columns[amountColIndex]);
            continue;
          }
          
          // Determine transaction type
          // A negative amount in the CSV usually indicates a debit
          const isNegative = amountStr.startsWith('-') || 
                             amountStr.includes('(') && amountStr.includes(')');
          const type = isNegative ? 'debit' : 'credit';
          
          transactions.push({
            id: `trans-${i}`,
            date,
            description,
            amount,
            type,
            // By default, select only debit transactions
            selected: type === 'debit',
          });
        } catch (err) {
          console.warn('Error parsing row:', err, columns);
          // Continue to the next row instead of failing completely
        }
      }
      
      if (transactions.length === 0) {
        onError('No valid transactions found in the file. Please check the format.');
      } else {
        console.log('Successfully parsed', transactions.length, 'transactions');
        onComplete(transactions);
      }
    } catch (err) {
      console.error('Error parsing CSV:', err);
      onError('Failed to parse the file. Please check the format and try again.');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read the file');
  };
  
  reader.readAsText(file);
};
