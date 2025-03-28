
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./parsers/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Save transactions to the database
 */
export const saveTransactionsToDatabase = async (
  transactions: ParsedTransaction[],
  batchId: string
): Promise<boolean> => {
  try {
    // Filter only selected transactions
    const selectedTransactions = transactions.filter(tx => tx.selected);
    
    if (selectedTransactions.length === 0) {
      return false;
    }
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("Auth error:", userError);
      toast.error("Authentication error. Please sign in again.");
      return false;
    }
    
    const userId = userData.user.id;
    
    // Prepare transactions for storage
    const transactionsToStore = selectedTransactions.map(tx => ({
      id: uuidv4(),
      batch_id: batchId,
      date: new Date(tx.date).toISOString(),
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      source: tx.source || 'other',
      revenue_number: `REV-${Math.floor(Math.random() * 10000)}`,
      status: 'paid', // Add the required status field
      created_at: new Date().toISOString(),
      user_id: userId
    }));
    
    // Store in revenues table
    const { error: insertError } = await supabase
      .from('revenues')
      .insert(transactionsToStore);
    
    if (insertError) {
      console.error("Error inserting transactions:", insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving transactions to database:", error);
    return false;
  }
};

/**
 * Prepare revenue entries from selected transactions
 */
export const prepareRevenuesFromTransactions = async (
  transactions: ParsedTransaction[],
  batchId: string,
  fileName: string
) => {
  try {
    // Get current user - make sure to await the Promise
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData || !userData.user) {
      toast.error("Authentication error. Please sign in again.");
      return [];
    }
    
    const userId = userData.user.id;
    
    // Filter only selected transactions with a source
    const selectedTransactions = transactions.filter(tx => tx.selected && tx.source);
    
    // Convert transactions to revenue entries
    const revenues = selectedTransactions.map(tx => ({
      id: uuidv4(),
      user_id: userId,
      revenue_number: `REV-${Math.floor(Math.random() * 10000)}`,
      description: tx.description,
      amount: tx.amount,
      date: new Date(tx.date),
      source: tx.source || 'other',
      status: 'paid', // Add the required status field
      created_at: new Date(),
      notes: `Imported from bank statement: ${fileName}. Batch ID: ${batchId}`
    }));
    
    return revenues;
  } catch (error) {
    console.error("Error preparing revenues:", error);
    return [];
  }
};
