
import { useEffect } from "react";
import { toast } from "sonner";
import { Transaction } from "@/types/ledger";
import { useTransactionState } from "./useTransactionState";
import { 
  fetchTransactionsFromApi, 
  addTransactionToApi, 
  updateTransactionInApi, 
  deleteTransactionFromApi 
} from "./useLedgerApi";

export const useLedgerData = () => {
  const MIN_REFRESH_INTERVAL = 5000; // 5 seconds
  
  const {
    transactions,
    setTransactions,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastRefreshTime,
    setLastRefreshTime
  } = useTransactionState();

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
      
      const result = await fetchTransactionsFromApi();
      
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result.transactions);
      }
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
      const newTransaction = await addTransactionToApi(transaction);
      
      if (newTransaction) {
        // Update local state with the new transaction
        setTransactions((prev) => [newTransaction, ...prev]);
      }
      
      return;
    } catch (error: any) {
      // Error handling is done in the API function
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateTransactionInApi(id, updates);

      // Update local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        )
      );
    } catch (error: any) {
      // Error handling is done in the API function
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionFromApi(id);

      // Remove from local state
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (error: any) {
      // Error handling is done in the API function
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
