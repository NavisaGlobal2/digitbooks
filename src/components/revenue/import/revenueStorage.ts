import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./parsers/types";
import { Revenue } from "@/types/revenue";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

// Save transaction data to database for record keeping
export const saveTransactionsToDatabase = async (
  transactions: ParsedTransaction[],
  batchId: string
): Promise<boolean> => {
  try {
    // Only save the selected transactions
    const selectedTransactions = transactions.filter(tx => tx.selected);
    
    if (selectedTransactions.length === 0) {
      console.warn("No transactions selected to save to database");
      return false;
    }
    
    // Generate revenue number sequence for this batch
    const dateStr = format(new Date(), "yyyyMMdd");
    const batchPrefix = `RV${dateStr}`;
    
    // Prepare the transaction data for storage
    const transactionsToSave = selectedTransactions.map((tx, index) => ({
      id: uuidv4(),
      batch_id: batchId,
      transaction_date: new Date(tx.date),
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      source: tx.source || null,
      revenue_number: `${batchPrefix}-${index + 1}`,
      created_at: new Date(),
    }));
    
    // Insert into the database
    const { error } = await supabase
      .from('revenue_transactions')
      .insert(transactionsToSave);
    
    if (error) {
      console.error("Error inserting transactions:", error);
      return false;
    }
    
    console.log(`Saved ${selectedTransactions.length} raw transactions to database`);
    return true;
  } catch (error) {
    console.error("Error saving transactions to database:", error);
    return false;
  }
};

// Prepare revenues from the parsed transactions
export const prepareRevenuesFromTransactions = (
  transactions: ParsedTransaction[], 
  batchId: string,
  fileName: string
): Omit<Revenue, "id">[] => {
  // Only use selected transactions
  const selectedTransactions = transactions.filter(tx => tx.selected && tx.source);
  
  // Generate unique revenue numbers
  const dateStr = format(new Date(), "yyyyMMdd");
  const batchShort = batchId.substring(0, 5);
  
  // Map transactions to revenues
  return selectedTransactions.map((tx, index) => {
    const revenueNumber = `RV-${dateStr}-${batchShort}-${index + 1}`;
    
    return {
      amount: tx.amount,
      description: tx.description,
      date: new Date(tx.date),
      source: tx.source!, // Non-null assertion since we filtered for tx.source above
      paymentMethod: 'bank transfer', // Default for bank statement imports
      paymentStatus: 'paid', // Default for bank statement imports
      notes: `Imported from bank statement: ${fileName} (Batch ID: ${batchId})`,
      isRecurring: false,
    };
  });
};
