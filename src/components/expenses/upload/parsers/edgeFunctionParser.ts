
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { ExpenseCategory } from "@/types/expense";

export const parseViaEdgeFunction = async (
  file: File,
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  try {
    // First check if the user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Authentication error:", sessionError);
      onError('Authentication error: ' + sessionError.message);
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session found");
      onError('Authentication required to parse files. Please sign in to use this feature.');
      return false;
    }
    
    if (!sessionData.session.access_token) {
      console.error("No access token found in session");
      onError('Invalid authentication token. Please sign out and sign in again.');
      return false;
    }
    
    const accessToken = sessionData.session.access_token;
    console.log('Session found, token length:', accessToken.length);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Preparing to call parse-bank-statement edge function...');
    
    // Set up a timeout for the function call
    const timeoutDuration = 60000; // 60 seconds
    
    try {
      console.log('Using supabase.functions.invoke to call the edge function');
      
      // Call the edge function with an increased timeout
      const { data, error: functionError } = await supabase.functions.invoke(
        'parse-bank-statement',
        {
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        
        // Provide more specific error messages based on the error type
        if (functionError.message?.includes('JWT')) {
          throw new Error('Authentication token is invalid or expired. Please sign in again.');
        }
        
        if (functionError.message?.includes('timeout') || functionError.message?.includes('timed out')) {
          throw new Error('Server processing timed out. Please try a smaller file or use client-side processing.');
        }
        
        throw new Error(`Edge function error: ${functionError.message || 'Unknown error'}`);
      }
      
      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No data returned from edge function. The server may be experiencing issues.');
      }
      
      console.log('Edge function response:', data);
      
      if (!data.batchId) {
        console.error('No batchId found in edge function response:', data);
        throw new Error('Invalid server response. Please try again or use client-side processing.');
      }
      
      // After successful function call, fetch the transactions with timeout
      const abortController = new AbortController();
      const fetchTimeoutId = setTimeout(() => abortController.abort(), timeoutDuration);
      
      try {
        // Add small delay to ensure database has time to insert records
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: transactionsData, error: fetchError } = await supabase
          .from('uploaded_bank_lines')
          .select('*')
          .eq('upload_batch_id', data.batchId)
          .order('date', { ascending: false })
          .abortSignal(abortController.signal);
        
        // Clear the fetch timeout
        clearTimeout(fetchTimeoutId);
        
        if (fetchError) {
          console.error('Failed to retrieve transactions:', fetchError);
          throw new Error(`Failed to retrieve processed transactions: ${fetchError.message}`);
        }
        
        if (!transactionsData || transactionsData.length === 0) {
          console.warn('No transactions found for batch ID:', data.batchId);
          toast.warning('No transactions were found in the uploaded file. Please check the file format.');
          onError('No transactions were found. The file may be empty or in an unsupported format.');
          return false;
        }
        
        console.log('Retrieved transactions data:', transactionsData.length, 'transactions');
        
        // Convert to the format expected by the component
        const transactions: ParsedTransaction[] = transactionsData.map((item) => ({
          id: item.id,
          date: new Date(item.date),
          description: item.description,
          amount: item.amount,
          type: item.type as 'credit' | 'debit',
          selected: item.type === 'debit', // Automatically select debit transactions
          category: item.category as ExpenseCategory | undefined
        }));
        
        console.log(`Successfully processed ${transactions.length} transactions from edge function`);
        console.log(`Transaction types: ${transactions.filter(t => t.type === 'debit').length} debits, ${transactions.filter(t => t.type === 'credit').length} credits`);
        onComplete(transactions);
        
        return true;
      } catch (fetchError: any) {
        console.error('Error fetching transaction data:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Database query timed out. The server may be experiencing high load.');
        }
        
        throw fetchError;
      }
    } catch (functionError: any) {
      console.error('Error calling edge function:', functionError);
      
      // Check if this is an abort error (timeout)
      if (functionError.name === 'AbortError') {
        throw new Error('Server processing timed out after 60 seconds. Please try client-side processing or a smaller file.');
      }
      
      // Check if the error is a network error
      if (functionError.message?.includes('Failed to fetch') || 
          functionError.message?.includes('Network error')) {
        throw new Error('Network error while uploading. Please check your internet connection and try again.');
      }
      
      // Auth specific errors
      if (functionError.message?.includes('auth') || 
          functionError.message?.includes('Authentication') ||
          functionError.message?.includes('JWT') ||
          functionError.message?.includes('token')) {
        throw new Error('Authentication error: ' + functionError.message + '. Please sign out and sign in again.');
      }
      
      // Try to extract a more helpful error message
      let errorMessage = 'Failed to process file via server. Falling back to client-side processing.';
      if (functionError instanceof Error) {
        if (functionError.message.includes('timed out')) {
          errorMessage = 'Server processing timed out. Please try client-side processing or a smaller file.';
        } else if (functionError.message.includes('non-2xx status code')) {
          errorMessage = 'Server function is unavailable or authentication error. Please try again later.';
        } else {
          errorMessage = functionError.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error in parseViaEdgeFunction:', error);
    onError(error.message || 'Failed to process the file. Please try again.');
    return false;
  }
};
