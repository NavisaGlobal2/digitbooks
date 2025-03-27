
import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from './statementParsers';
import { ExpenseCategory } from '@/types/expense';
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
    
    // Use the edge function to parse and save the bank statement
    // This is for future use - the current implementation still directly inserts to the DB
    const fileUpload = false;
    if (fileUpload) {
      // This approach would use the edge function for file parsing
      // For now we're doing the parsing client-side
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

export const prepareExpensesFromTransactions = (
  transactions: ParsedTransaction[],
  batchId: string,
  fileName: string
) => {
  return transactions
    .filter(t => t.selected && t.category) 
    .map(transaction => ({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category as ExpenseCategory,
      status: "pending" as const,
      paymentMethod: "bank transfer" as const,
      vendor: "Bank Statement Import",
      notes: `Imported from bank statement: ${fileName}`,
      fromStatement: true,
      batchId: batchId
    }));
};
