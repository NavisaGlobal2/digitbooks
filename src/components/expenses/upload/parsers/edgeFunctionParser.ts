
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
    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error || !sessionData.session?.access_token) {
      console.error("Authentication error:", error);
      onError('Authentication required to parse files. Please sign in again.');
      return false;
    }
    
    const accessToken = sessionData.session.access_token;
    console.log('Session found, token length:', accessToken.length);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Preparing to call parse-bank-statement edge function...');
    
    try {
      console.log('Using supabase.functions.invoke to call the edge function');
      
      // Call the edge function using Supabase Functions invoke
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
        throw new Error(`Edge function error: ${functionError.message}`);
      }
      
      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No data returned from edge function');
      }
      
      console.log('Edge function response:', data);
      
      // If successful, fetch the transactions from the database
      const { data: transactionsData, error: fetchError } = await supabase
        .from('uploaded_bank_lines')
        .select('*')
        .eq('upload_batch_id', data.batchId)
        .order('date', { ascending: false });
      
      if (fetchError || !transactionsData || transactionsData.length === 0) {
        console.error('Failed to retrieve transactions or no transactions found:', fetchError);
        throw new Error('Failed to retrieve processed transactions');
      }
      
      // Convert to the format expected by the component
      const transactions: ParsedTransaction[] = transactionsData.map((item) => ({
        id: item.id,
        date: new Date(item.date),
        description: item.description,
        amount: item.amount,
        type: item.type as 'credit' | 'debit',
        selected: item.type === 'debit',
        category: item.category as ExpenseCategory | undefined
      }));
      
      console.log(`Successfully processed ${transactions.length} transactions from edge function`);
      onComplete(transactions);
      
      return true;
    } catch (functionError) {
      console.error('Error calling edge function:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('Error in parseViaEdgeFunction:', error);
    onError(error.message || 'Failed to process the file. Please try again.');
    return false;
  }
};
