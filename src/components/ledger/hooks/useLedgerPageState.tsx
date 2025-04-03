
import { useState, useCallback, useEffect } from 'react';
import { useLedger } from "@/contexts/LedgerContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useLedgerPageState = () => {
  const { transactions, isLoading, refreshTransactions, error } = useLedger();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const MAX_AUTO_REFRESH_ATTEMPTS = 1;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth check error:", error);
        setAuthStatus("Error checking authentication status");
      } else if (!data.session) {
        console.log("User is not authenticated");
        setAuthStatus("Not authenticated");
      } else {
        console.log("User is authenticated as:", data.session.user?.id);
        setAuthStatus("Authenticated");
      }
    };
    
    checkAuth();
  }, []);

  const refreshData = useCallback(async () => {
    if (refreshAttempts >= MAX_AUTO_REFRESH_ATTEMPTS) {
      console.log("Max auto-refresh attempts reached");
      return;
    }

    try {
      setIsRefreshing(true);
      setRefreshAttempts(prev => prev + 1);
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransactions, refreshAttempts]);

  useEffect(() => {
    // Only try to auto-refresh when loading completes
    if (!isLoading && refreshAttempts === 0) {
      refreshData();
    }
  }, [isLoading, refreshData, refreshAttempts]);

  const handleEditTransaction = (id: string) => {
    setEditTransactionId(id);
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshAttempts(0); // Reset attempts counter for manual refresh
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Debug button to show current auth state
  const showDebugInfo = () => {
    toast.info(`Authentication status: ${authStatus || "unknown"}
    Transaction count: ${transactions.length}
    Error: ${error ? error.message : "none"}
    Loading: ${isLoading ? "yes" : "no"}`);
  };

  return {
    transactions,
    isLoading,
    error,
    showAddDialog,
    setShowAddDialog,
    editTransactionId,
    setEditTransactionId,
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen,
    isRefreshing,
    refreshAttempts,
    authStatus,
    handleEditTransaction,
    handleManualRefresh,
    showDebugInfo
  };
};
