
import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from '../parsers/types';
import { toast } from 'sonner';

export const saveTransactionsToDatabase = async (
  transactions: ParsedTransaction[], 
  batchId: string
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("No authenticated user found");
      return false;
    }
    
    // Save each transaction to the uploaded_bank_lines table
    for (const transaction of transactions) {
      if (!transaction.selected) continue;
      
      const { error } = await supabase
        .from('uploaded_bank_lines')
        .insert({
          user_id: userData.user.id,
          upload_batch_id: batchId,
          date: transaction.date.toISOString(),
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          status: 'unprocessed'
        });
        
      if (error) {
        console.error("Error saving bank transaction:", error);
        toast.error("Failed to save some transaction data");
      }
    }
    
    // Once all transactions are saved, use the database function to convert them to expenses
    const { error: savingError } = await supabase.rpc('save_tagged_expenses', { p_batch_id: batchId });
    
    if (savingError) {
      console.error("Error saving expenses:", savingError);
      toast.error("There was an issue converting transactions to expenses");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving transaction data:", error);
    return false;
  }
};
