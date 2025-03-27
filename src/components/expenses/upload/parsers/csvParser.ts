
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
      
      const transactions: ParsedTransaction[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 3) continue;
        
        const date = new Date(columns[0]);
        const description = columns[1].replace(/"/g, '');
        const amount = Math.abs(parseFloat(columns[2].replace(/[₦,"]/g, '')));
        
        const type = parseFloat(columns[2]) < 0 ? 'debit' : 'credit';
        
        transactions.push({
          id: `trans-${i}`,
          date,
          description,
          amount,
          type,
          selected: type === 'debit',
        });
      }
      
      if (transactions.length === 0) {
        onError('No valid transactions found in the file');
      } else {
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
