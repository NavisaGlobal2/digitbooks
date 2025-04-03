
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
}

interface LedgerContextValue {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
}

const LedgerContext = createContext<LedgerContextValue | undefined>(undefined);

export const LedgerProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch transactions from the database on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      
      // Transform the data into our Transaction format
      const formattedTransactions: Transaction[] = data.map((item: any) => ({
        id: item.id,
        date: new Date(item.date),
        description: item.description,
        amount: Number(item.amount),
        type: item.type,
        category: item.category
      }));
      
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error.message);
      toast.error("Failed to load transaction data");
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      // First insert the transaction into the database
      const { data, error } = await supabase
        .from("ledger_transactions")
        .insert({
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Then update our local state
      const newTransaction: Transaction = {
        id: data.id,
        date: new Date(data.date),
        description: data.description,
        amount: Number(data.amount),
        type: data.type,
        category: data.category
      };
      
      setTransactions((prev) => [newTransaction, ...prev]);
      return;
    } catch (error: any) {
      console.error("Error adding transaction:", error.message);
      toast.error("Failed to add transaction");
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      // Format updates for the database
      const dbUpdates: any = { ...updates };
      
      // If date is a Date object, ensure it's formatted correctly for the database
      if (updates.date instanceof Date) {
        dbUpdates.date = updates.date.toISOString().split('T')[0];
      }
      
      // Update the transaction in the database
      const { error } = await supabase
        .from("ledger_transactions")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        )
      );
    } catch (error: any) {
      console.error("Error updating transaction:", error.message);
      toast.error("Failed to update transaction");
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // Delete the transaction from the database
      const { error } = await supabase
        .from("ledger_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (error: any) {
      console.error("Error deleting transaction:", error.message);
      toast.error("Failed to delete transaction");
      throw error;
    }
  };

  return (
    <LedgerContext.Provider
      value={{ transactions, addTransaction, updateTransaction, deleteTransaction, isLoading }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
};
