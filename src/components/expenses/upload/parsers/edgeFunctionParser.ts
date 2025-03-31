import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";
import { ExpenseCategory } from "@/types/expense";

// Define the API base URL
const API_BASE = "https://workspace.john644.repl.co";

// Define interface for the API response
interface ApiResponse {
  success: boolean;
  message?: string;
  statement_id?: string;
  transactions?: any[];
  batchId?: string;
}

// Define interface for the transaction data from Supabase
interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  transaction_type?: string;
  category?: string | ExpenseCategory;
}

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
): Promise<ParsedTransaction[]> => {
  try {
    // Create a form to send the file
    const formData = new FormData();
    formData.append("file", file);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    // Choose the appropriate endpoint based on file type
    let endpoint;
    if (fileExt === 'pdf') {
      endpoint = 'api/upload'; // Use the new API endpoint for PDFs
    } else {
      endpoint = fileExt === 'pdf' ? 'parse-bank-statement-ai' : 'parse-bank-statement';
    }
    
    console.log(`Sending file to API endpoint: ${API_BASE}/${endpoint}`);
    
    // Check authentication status before making the request
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError);
      const errorMsg = "Authentication error: " + authError.message;
      onError(errorMsg);
      return [];
    }
    
    if (!authData.session) {
      console.error('No authentication session found');
      const errorMsg = "You need to be signed in to use this feature. Please sign in and try again.";
      onError(errorMsg);
      return [];
    }

    // Call the API endpoint
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      
      // Check for specific API errors
      if (errorText.includes("ANTHROPIC_API_KEY") || 
          errorText.includes("Anthropic API") ||
          errorText.includes("exceeded") ||
          errorText.includes("rate limit")) {
        const errorMsg = "API key error: Either the key is not configured, invalid, or you've exceeded your rate limit. Please contact your administrator.";
        onError(errorMsg);
        return [];
      }
      
      // Check for authentication errors
      if (errorText.includes("Auth session") ||
          errorText.includes("authentication") ||
          errorText.includes("unauthorized")) {
        const errorMsg = "Authentication error: Please try signing out and signing back in to refresh your session.";
        onError(errorMsg);
        return [];
      }
      
      onError(`Server error: ${errorText || response.statusText}`);
      return [];
    }

    // Parse the response as JSON with explicit typing
    const apiResponse = await response.json();
    const typedData = apiResponse as ApiResponse;

    // Handle the new API response format
    if (typedData.success === false) {
      onError(`API Error: ${typedData.message || "Unknown error processing statement"}`);
      return [];
    }

    if (!typedData.transactions && typedData.statement_id) {
      // We need to fetch the transactions from Supabase directly
      const { data: transactionsData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('statement_id', typedData.statement_id)
        .order('date', { ascending: false });
      
      if (transactionError || !transactionsData) {
        onError("Transactions were processed but couldn't be retrieved from the database.");
        return [];
      }
      
      // Map the database transactions to our ParsedTransaction format
      const parsedTransactions = transactionsData.map((tx: any) => {
        // Handle amount conversion safely
        const amountValue = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        
        const parsedTx: ParsedTransaction = {
          id: tx.id,
          date: new Date(tx.date),
          description: tx.description,
          amount: Math.abs(amountValue),
          type: (tx.transaction_type?.toLowerCase() === 'debit') ? 'debit' : 'credit',
          category: tx.category as ExpenseCategory | undefined,
          selected: tx.transaction_type?.toLowerCase() === 'debit',
          batchId: typedData.statement_id
        };
        
        return parsedTx;
      });
      
      // Call success callback with transactions
      if (parsedTransactions.length > 0) {
        onSuccess(parsedTransactions);
        
        if (parsedTransactions.length > 5) {
          toast.success(`Parsed ${parsedTransactions.length} transactions from your statement`);
        }
        
        return parsedTransactions;
      } else {
        onError("No transactions found in the processed statement.");
        return [];
      }
    }

    // Handle the legacy response format with transactions array directly in the response
    const transactions = typedData.transactions || [];
    
    // Map the server response to our ParsedTransaction type with explicit typing
    const parsedTransactions: ParsedTransaction[] = transactions.map((tx: any) => {
      const parsedTx: ParsedTransaction = {
        id: crypto.randomUUID(),
        date: new Date(tx.date),
        description: tx.description,
        amount: Math.abs(parseFloat(tx.amount.toString())),
        type: tx.type || (parseFloat(tx.amount.toString()) < 0 ? 'debit' : 'credit'),
        category: tx.category as ExpenseCategory | undefined,
        selected: tx.type === 'debit' || parseFloat(tx.amount.toString()) < 0,
        batchId: typedData.batchId || typedData.statement_id
      };
      
      return parsedTx;
    });

    // Filter transactions if needed (e.g., only include expenses)
    const filteredTransactions = parsedTransactions.filter(tx => 
      tx.type === 'debit' || parseFloat(tx.amount.toString()) < 0
    );
    
    if (filteredTransactions.length === 0) {
      onError("No expense transactions found in the statement. Only expense transactions can be imported.");
      return [];
    }

    // Call success callback with transactions
    onSuccess(filteredTransactions);
    
    // Only show toast for significant number of transactions
    if (filteredTransactions.length > 5) {
      toast.success(`Parsed ${filteredTransactions.length} expenses from your statement`);
    }
    
    return filteredTransactions;
  } catch (error) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};
