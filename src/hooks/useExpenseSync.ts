
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { expenseDatabaseOperations } from '@/utils/expenseDatabaseOperations';

export const useExpenseSync = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check for current user on initial load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        
        if (data?.user) {
          setCurrentUserId(data.user.id);
        }
      } catch (err) {
        console.error("Error in user check:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const syncExpenseToDatabase = async (expense: Expense) => {
    try {
      setIsSyncing(true);
      
      if (!currentUserId) {
        console.warn("No current user ID available, cannot sync to database");
        return false;
      }

      return await expenseDatabaseOperations.syncExpense(expense, currentUserId);
    } catch (error) {
      console.error("Error syncing expense to database:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const loadExpensesFromSupabase = async () => {
    try {
      setIsLoading(true);
      return await expenseDatabaseOperations.loadExpenses();
    } catch (error) {
      console.error("Error loading expenses from Supabase:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpenseFromDatabase = async (expenseId: string) => {
    try {
      return await expenseDatabaseOperations.deleteExpense(expenseId);
    } catch (error) {
      console.error("Error deleting expense:", error);
      return false;
    }
  };

  return {
    currentUserId,
    isLoading,
    isSyncing,
    setIsLoading,
    syncExpenseToDatabase,
    loadExpensesFromSupabase,
    deleteExpenseFromDatabase
  };
};
