
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
        const amount = Math.abs(parseFloat(columns[2].replace(/[₦,"]/g, ''))); // Added Naira symbol to replacement
        
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

export const parseExcelFile = async (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  try {
    // Get the auth session first with a more reliable method
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session?.access_token) {
      console.error("Authentication error:", error);
      onError('Authentication required to parse Excel files. Please sign in again.');
      return;
    }
    
    const accessToken = data.session.access_token;
    console.log('Session found, token length:', accessToken.length);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Preparing to call parse-bank-statement edge function...');
    
    // Create a properly formatted headers object with Bearer prefix
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${accessToken}`);
    
    // Log token for debugging (partially redacted for security)
    console.log('Using auth token:', accessToken.substring(0, 5) + '...' + accessToken.substring(accessToken.length - 5));
    
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    
    // Call the edge function with proper authentication header
    const response = await fetch(`${supabaseUrl}/functions/v1/parse-bank-statement`, {
      method: 'POST',
      body: formData,
      headers: headers,
      credentials: 'include' // Include cookies for session handling
    });
    
    console.log('Edge function response status:', response.status);
    
    // Handle unauthorized errors specifically
    if (response.status === 401) {
      console.error('Authentication error: Unauthorized access');
      // Force re-authentication
      await supabase.auth.refreshSession();
      onError('Your session has expired. Please sign out and sign in again.');
      return;
    }
    
    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from edge function:', errorData);
      throw new Error(`Failed to parse Excel file: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('Edge function response data:', data);
    
    if (!data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      onError('No valid transactions found in the file');
      return;
    }
    
    // Convert the transactions to the expected format
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((t: any, index: number) => ({
      id: `trans-${index}`,
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      type: t.type,
      selected: t.type === 'debit', // Auto-select debit transactions
    }));
    
    onComplete(parsedTransactions);
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
    parseExcelFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.pdf')) {
    parsePDFFile(file, onSuccess, onError);
  } else {
    onError('Unsupported file format');
  }
};
