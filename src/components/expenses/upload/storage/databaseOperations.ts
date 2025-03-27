
import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from '../parsers/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Generate a proper UUID for the batch ID
    const properBatchId = uuidv4();
    console.log(`Using batch ID: ${properBatchId} for ${transactions.length} transactions`);
    
    // Count how many transactions we're trying to save
    const selectedTransactions = transactions.filter(t => t.selected);
    console.log(`Attempting to save ${selectedTransactions.length} selected transactions out of ${transactions.length} total`);
    
    let successCount = 0;
    // Save each transaction to the uploaded_bank_lines table
    for (const transaction of transactions) {
      // Only process selected transactions
      if (!transaction.selected) {
        console.log(`Skipping unselected transaction: ${transaction.description}`);
        continue;
      }
      
      console.log(`Saving transaction: ${transaction.description}, category: ${transaction.category}`);
      
      const { error } = await supabase
        .from('uploaded_bank_lines')
        .insert({
          user_id: userData.user.id,
          upload_batch_id: properBatchId,
          date: transaction.date.toISOString(),
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          status: 'unprocessed'
        });
        
      if (error) {
        console.error("Error saving bank transaction:", error);
        toast.error(`Failed to save transaction: ${error.message}`);
      } else {
        successCount++;
      }
    }
    
    console.log(`Successfully saved ${successCount} out of ${selectedTransactions.length} selected transactions`);
    
    // If no transactions were saved, don't try to run the database function
    if (successCount === 0) {
      toast.error("No transactions were saved to the database");
      return false;
    }
    
    // Once all transactions are saved, use the database function to convert them to expenses
    const { error: savingError } = await supabase.rpc('save_tagged_expenses', { p_batch_id: properBatchId });
    
    if (savingError) {
      console.error("Error saving expenses:", savingError);
      toast.error(`Database error: ${savingError.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving transaction data:", error);
    toast.error("Unexpected error while saving transactions");
    return false;
  }
};
