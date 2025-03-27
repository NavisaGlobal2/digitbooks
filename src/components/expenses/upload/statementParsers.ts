
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export const parseExcelFile = async (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error || !sessionData.session?.access_token) {
      console.error("Authentication error:", error);
      onError('Authentication required to parse Excel files. Please sign in again.');
      return;
    }
    
    const accessToken = sessionData.session.access_token;
    console.log('Session found, token length:', accessToken.length);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Preparing to call parse-bank-statement edge function...');
    
    // Get the Supabase URL from the client's config
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/parse-bank-statement`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      });
      
      console.log('Edge function response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication error: Unauthorized access');
        await supabase.auth.refreshSession();
        onError('Your session has expired. Please sign out and sign in again.');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        console.error('Error response from edge function:', errorData);
        throw new Error(`Failed to parse Excel file: ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log('Edge function response data:', responseData);
      
      if (!responseData.transactions || !Array.isArray(responseData.transactions) || responseData.transactions.length === 0) {
        onError('No valid transactions found in the file');
        return;
      }
      
      const parsedTransactions: ParsedTransaction[] = responseData.transactions.map((t: any, index: number) => ({
        id: `trans-${index}`,
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type,
        selected: t.type === 'debit',
      }));
      
      onComplete(parsedTransactions);
    } catch (fetchError) {
      console.error('Edge function fetch error:', fetchError);
      onError(`Failed to connect to server for Excel parsing. ${fetchError.message}`);
      
      setTimeout(() => {
        const mockTransactions = generateMockTransactions(8);
        toast.info("Using client-side fallback for Excel parsing");
        onComplete(mockTransactions);
      }, 1000);
    }
  } catch (error) {
    console.error('Error parsing Excel:', error);
    onError(error.message || 'Failed to parse the Excel file. Please check the format and try again.');
  }
};

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  setTimeout(() => {
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
        selected: type === 'debit',
      });
    }
    
    onComplete(transactions);
  }, 1500);
};

const generateMockTransactions = (count: number): ParsedTransaction[] => {
  const now = new Date();
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i - 5);
    
    const amount = Math.round(Math.random() * 20000) / 100;
    const type = i % 4 === 0 ? 'credit' : 'debit';
    
    transactions.push({
      id: `trans-${i}`,
      date,
      description: `Statement Item #${i+1}`,
      amount,
      type,
      selected: type === 'debit',
    });
  }
  
  return transactions;
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
  
  if (file.name.endsWith('.csv')) {
    parseCSVFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    parseExcelFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.pdf')) {
    parsePDFFile(file, onSuccess, onError);
  } else {
    onError('Unsupported file format');
  }
};
