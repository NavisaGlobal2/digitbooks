
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

export const useExpenseSync = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for current user on initial load
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    checkUser();
  }, []);

  const syncExpenseToDatabase = async (expense: Expense) => {
    try {
      // Make sure we have a current user ID
      if (!currentUserId) {
        console.warn("No current user ID available, cannot sync to database");
        return false;
      }

      const expenseForDb = {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
        category: expense.category,
        status: expense.status,
        payment_method: expense.paymentMethod,
        vendor: expense.vendor,
        receipt_url: expense.receiptUrl || null,
        notes: expense.notes || null,
        from_statement: expense.fromStatement || false,
        batch_id: expense.batchId || null,  // Add the batch_id
        user_id: currentUserId
      };
      
      const { error } = await supabase
        .from('expenses')
        .upsert(expenseForDb, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error("Failed to sync expense to database:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing expense to database:", error);
      return false;
    }
  };

  const loadExpensesFromSupabase = async () => {
    try {
      const { data: dbExpenses, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Failed to load expenses from Supabase:", error);
        throw error;
      }
      
      if (dbExpenses && dbExpenses.length > 0) {
        console.log("Loaded expenses from Supabase:", dbExpenses.length);
        const formattedExpenses = dbExpenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
          receiptUrl: expense.receipt_url || null,
          paymentMethod: expense.payment_method,
          fromStatement: expense.from_statement,
          batchId: expense.batch_id || null  // Map the batch_id
        }));
        
        return formattedExpenses;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading expenses from Supabase:", error);
      return null;
    }
  };

  const deleteExpenseFromDatabase = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) {
        console.error("Failed to delete expense from database:", error);
        toast.error("Failed to delete expense from database");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense from database");
      return false;
    }
  };

  return {
    currentUserId,
    isLoading,
    setIsLoading,
    syncExpenseToDatabase,
    loadExpensesFromSupabase,
    deleteExpenseFromDatabase
  };
};
