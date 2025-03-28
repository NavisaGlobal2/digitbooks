
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "../parsers/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Save bank statement transactions to the database
 */
export const saveTransactionsToDatabase = async (
  transactions: ParsedTransaction[],
  batchId: string
): Promise<boolean> => {
  try {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to save to database');
      return true;
    }

    console.log(`Saving ${transactions.length} transactions to database with batch ID: ${batchId}`);

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('User not authenticated');
      return false;
    }

    // Convert batchId to a proper UUID if it's not already
    const validBatchId = batchId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
      ? batchId 
      : uuidv4();

    // Filter only selected transactions
    const selectedTransactions = transactions.filter(t => t.selected);
    console.log(`Selected ${selectedTransactions.length} transactions for database save`);
    
    if (selectedTransactions.length === 0) {
      console.log('No selected transactions to save');
      return true;
    }

    // Insert transactions into uploaded_bank_lines table
    const { data, error } = await supabase
      .from('uploaded_bank_lines')
      .insert(
        selectedTransactions.map(t => ({
          user_id: userData.user.id,
          upload_batch_id: validBatchId,
          date: new Date(t.date).toISOString().split('T')[0],
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          status: 'processed'
        }))
      );

    if (error) {
      console.error('Error saving bank transactions:', error);
      return false;
    }

    console.log(`Successfully saved ${selectedTransactions.length} transactions to database`);
    return true;
  } catch (error) {
    console.error('Error saving expenses:', error);
    return false;
  }
};
