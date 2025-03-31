
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "../types";
import { ExpenseCategory } from "@/types/expense";
import { ApiResponse, TransactionData } from "./types";

// Map database transactions to ParsedTransaction format
export const mapDatabaseTransactions = async (statementId: string): Promise<ParsedTransaction[]> => {
  try {
    const { data: transactionsData, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('statement_id', statementId)
      .order('date', { ascending: false });
    
    if (transactionError || !transactionsData) {
      console.error('Error fetching transactions:', transactionError);
      return [];
    }
    
    // Map the database transactions to our ParsedTransaction format
    return transactionsData.map((tx: TransactionData) => {
      // Handle amount conversion safely
      const amountValue = typeof tx.amount === 'string' ? parseFloat(tx.amount.toString()) : tx.amount;
      
      const parsedTx: ParsedTransaction = {
        id: tx.id,
        date: new Date(tx.date),
        description: tx.description,
        amount: Math.abs(Number(amountValue)),
        type: (tx.transaction_type?.toLowerCase() === 'debit') ? 'debit' : 'credit',
        category: tx.category as ExpenseCategory | undefined,
        selected: tx.transaction_type?.toLowerCase() === 'debit',
        batchId: statementId
      };
      
      return parsedTx;
    });
  } catch (error) {
    console.error('Error mapping database transactions:', error);
    return [];
  }
};

// Map raw API response transactions to ParsedTransaction format
export const mapApiResponseTransactions = (
  transactions: any[],
  batchId?: string
): ParsedTransaction[] => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }
  
  return transactions.map((tx: any) => {
    const parsedTx: ParsedTransaction = {
      id: crypto.randomUUID(),
      date: new Date(tx.date),
      description: tx.description,
      amount: Math.abs(parseFloat(tx.amount.toString())),
      type: tx.type || (parseFloat(tx.amount.toString()) < 0 ? 'debit' : 'credit'),
      category: tx.category as ExpenseCategory | undefined,
      selected: tx.type === 'debit' || parseFloat(tx.amount.toString()) < 0,
      batchId: batchId
    };
    
    return parsedTx;
  });
};
