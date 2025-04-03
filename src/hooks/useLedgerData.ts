
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from "@/types/ledger";

export const useLedgerData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const MIN_REFRESH_INTERVAL = 5000; // 5 seconds

  // Fetch transactions from the database on component mount
  useEffect(() => {
    console.log("Initial fetch of transactions");
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log("Starting to fetch transactions");
      setIsLoading(true);
      setError(null);
      
      // Get current user session to filter by user_id
      console.log("Getting user session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw sessionError;
      }
      
      const userId = session?.user?.id;
      console.log("Current user ID:", userId);
      
      if (!userId) {
        console.error("User not authenticated");
        setIsLoading(false);
        setError(new Error("User not authenticated"));
        return;
      }
      
      // Using the generic "from" method with user_id filter
      console.log(`Querying ledger_transactions for user_id: ${userId}`);
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .eq("user_id", userId) // Add filter by user_id
        .order("date", { ascending: false }) as { data: any[], error: any };

      console.log("Query result:", { data, error });

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }
      
      // Check if we got data back
      if (!data || data.length === 0) {
        console.log("No transactions found for this user");
      } else {
        console.log(`Found ${data.length} transactions`);
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
      
      console.log("Formatted transactions:", formattedTransactions);
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error.message);
      setError(error);
      // Don't show toast on every load error to prevent spamming
    } finally {
      setIsLoading(false);
      setLastRefreshTime(Date.now());
      console.log("Fetch transactions completed");
    }
  };

  // Add function to manually refresh transactions
  const refreshTransactions = async () => {
    try {
      // Prevent excessive refreshing
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        console.log(`Refresh rate limited, try again later. Last refresh was ${(now - lastRefreshTime)/1000} seconds ago`);
        return;
      }
      
      console.log("Manual refresh triggered");
      await fetchTransactions();
      // Only show success toast for manual refreshes
      toast.success("Transactions refreshed");
    } catch (error: any) {
      console.error("Error refreshing transactions:", error.message);
      toast.error("Failed to refresh transactions");
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      // Format the date for Supabase - convert Date object to ISO string and extract the date part
      const formattedDate = transaction.date instanceof Date 
        ? transaction.date.toISOString().split('T')[0] 
        : transaction.date;

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // First insert the transaction into the database
      const { data, error } = await supabase
        .from("ledger_transactions")
        .insert({
          date: formattedDate,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          user_id: userId
        })
        .select() as { data: any[], error: any };

      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after insert");
      }
      
      // Then update our local state
      const newTransaction: Transaction = {
        id: data[0].id,
        date: new Date(data[0].date),
        description: data[0].description,
        amount: Number(data[0].amount),
        type: data[0].type,
        category: data[0].category
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
        .eq("id", id) as { error: any };

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
        .eq("id", id) as { error: any };

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

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
