
import { toast } from "sonner";

export type ParsedTransaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  selected: boolean;
};

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
      
      // Skip header row and parse each line
      const transactions: ParsedTransaction[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 3) continue;
        
        // For this example, assuming CSV format: date, description, amount
        const date = new Date(columns[0]);
        const description = columns[1].replace(/"/g, '');
        const amount = Math.abs(parseFloat(columns[2].replace(/"/g, '')));
        
        // Determine if credit or debit
        const type = parseFloat(columns[2]) < 0 ? 'debit' : 'credit';
        
        transactions.push({
          id: `trans-${i}`,
          date,
          description,
          amount,
          type,
          selected: type === 'debit', // Auto-select debit transactions
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

export const parseExcelFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void
) => {
  // Mock Excel parsing for this example
  // In a real app, use a library like xlsx or exceljs
  setTimeout(() => {
    // Generate mock data for demonstration
    const transactions: ParsedTransaction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const amount = Math.round(Math.random() * 10000) / 100;
      const type = i % 3 === 0 ? 'credit' : 'debit';
      
      transactions.push({
        id: `trans-${i}`,
        date,
        description: `Transaction #${i+1} from Excel`,
        amount,
        type,
        selected: type === 'debit', // Auto-select debit transactions
      });
    }
    
    onComplete(transactions);
  }, 1000);
};

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void
) => {
  // Mock PDF parsing for this example
  // In a real app, use a PDF parsing library or service
  setTimeout(() => {
    // Generate mock data for demonstration
    const transactions: ParsedTransaction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i - 5);
      
      const amount = Math.round(Math.random() * 20000) / 100;
      const type = i % 4 === 0 ? 'credit' : 'debit';
      
      transactions.push({
        id: `trans-${i}`,
        date,
        description: `PDF Statement Item #${i+1}`,
        amount,
        type,
        selected: type === 'debit', // Auto-select debit transactions
      });
    }
    
    onComplete(transactions);
  }, 1500);
};

export const parseStatementFile = (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  if (!file) {
    toast.error("Please select a bank statement file");
    return;
  }
  
  // Parse file based on extension
  if (file.name.endsWith('.csv')) {
    parseCSVFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    parseExcelFile(file, onSuccess);
  } else if (file.name.endsWith('.pdf')) {
    parsePDFFile(file, onSuccess);
  } else {
    onError('Unsupported file format');
  }
};
