
import { useState } from "react";
import { Transaction } from "@/types/ledger";

export function useTransactionState() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  return {
    transactions,
    setTransactions,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastRefreshTime,
    setLastRefreshTime
  };
}
