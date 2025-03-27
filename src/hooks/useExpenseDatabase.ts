
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseSync } from '@/hooks/useExpenseSync';

export const useExpenseDatabase = () => {
  const { 
    currentUserId, 
    isLoading, 
    isSyncing,
    syncExpenseToDatabase, 
    loadExpensesFromSupabase,
    deleteExpenseFromDatabase 
  } = useExpenseSync();

  const loadExpenses = async () => {
    try {
      const dbExpenses = await loadExpensesFromSupabase();
      return dbExpenses || [];
    } catch (error) {
      console.error("Failed to load expenses from database:", error);
      return null;
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      const synced = await syncExpenseToDatabase(expense);
      
      if (synced) {
        return { success: true, message: "Expense added successfully" };
      } else {
        return { success: false, message: "Expense added locally but failed to sync to database" };
      }
    } catch (error) {
      console.error("Error adding expense to database:", error);
      return { success: false, message: "Error adding expense" };
    }
  };

  const addExpensesBatch = async (expenses: Expense[]) => {
    try {
      let syncedCount = 0;
      for (const expense of expenses) {
        const synced = await syncExpenseToDatabase(expense);
        if (synced) syncedCount++;
      }
      
      if (syncedCount === expenses.length) {
        return { 
          success: true, 
          message: `${expenses.length} expenses added successfully`,
          syncedCount
        };
      } else {
        return { 
          success: syncedCount > 0, 
          message: `${syncedCount} of ${expenses.length} expenses synced to database`,
          syncedCount
        };
      }
    } catch (error) {
      console.error("Error adding expenses batch to database:", error);
      return { success: false, message: "Error adding expenses batch", syncedCount: 0 };
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      const synced = await syncExpenseToDatabase(expense);
      
      if (synced) {
        return { success: true, message: "Expense updated successfully" };
      } else {
        return { success: false, message: "Expense updated locally but failed to sync to database" };
      }
    } catch (error) {
      console.error("Error updating expense in database:", error);
      return { success: false, message: "Error updating expense" };
    }
  };

  const updateExpenseStatus = async (expense: Expense, status: ExpenseStatus) => {
    try {
      const updatedExpense = { ...expense, status };
      const synced = await syncExpenseToDatabase(updatedExpense);
      
      if (synced) {
        return { success: true, message: `Expense status updated to ${status}` };
      } else {
        return { success: false, message: "Expense status updated locally but failed to sync to database" };
      }
    } catch (error) {
      console.error("Error updating expense status in database:", error);
      return { success: false, message: "Error updating expense status" };
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const deleted = await deleteExpenseFromDatabase(expenseId);
      
      if (deleted) {
        return { success: true, message: "Expense deleted successfully" };
      } else {
        return { success: false, message: "Failed to delete expense from database" };
      }
    } catch (error) {
      console.error("Error deleting expense from database:", error);
      return { success: false, message: "Error deleting expense" };
    }
  };

  return {
    currentUserId,
    isLoading,
    isSyncing,
    loadExpenses,
    addExpense,
    addExpensesBatch,
    updateExpense,
    updateExpenseStatus,
    deleteExpense
  };
};
