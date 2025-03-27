
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseSync } from '@/hooks/useExpenseSync';
import { useExpenseData } from '@/hooks/useExpenseData';
import { safelyStoreExpenses, loadExpensesFromLocalStorage } from '@/utils/expenseStorage';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus) => void;
  deleteExpense: (expenseId: string) => void;
  getTotalExpenses: () => number;
  getExpensesByCategory: () => Record<string, number>;
  updateExpense: (expense: Expense) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { 
    currentUserId, 
    isLoading, 
    setIsLoading, 
    syncExpenseToDatabase, 
    loadExpensesFromSupabase,
    deleteExpenseFromDatabase 
  } = useExpenseSync();
  const expenseData = useExpenseData(expenses);

  // Load expenses from database and localStorage on initial load
  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      
      try {
        // First try to load from Supabase
        const dbExpenses = await loadExpensesFromSupabase();
        
        if (dbExpenses && dbExpenses.length > 0) {
          setExpenses(dbExpenses);
        } else {
          // Fallback to localStorage if no database expenses
          const localExpenses = loadExpensesFromLocalStorage();
          
          if (localExpenses) {
            setExpenses(localExpenses);
            
            // If we loaded from localStorage, sync them to Supabase
            if (currentUserId) {
              localExpenses.forEach(async (expense: Expense) => {
                await syncExpenseToDatabase(expense);
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
        
        // Final fallback to localStorage
        const localExpenses = loadExpensesFromLocalStorage();
        if (localExpenses) {
          setExpenses(localExpenses);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExpenses();
  }, [currentUserId, setIsLoading]);

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    console.log("Adding new expense:", expenseData);
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    
    // Optimistically update the UI
    setExpenses(prev => [newExpense, ...prev]);
    
    // Sync to database
    const synced = await syncExpenseToDatabase(newExpense);
    
    if (synced) {
      toast.success("Expense added successfully");
    } else {
      toast.success("Expense added locally but failed to sync to database");
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: ExpenseStatus) => {
    // Optimistically update the UI
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status } 
          : expense
      )
    );
    
    // Find the updated expense
    const updatedExpense = expenses.find(e => e.id === expenseId);
    
    if (updatedExpense) {
      // Sync to database
      const synced = await syncExpenseToDatabase({
        ...updatedExpense,
        status
      });
      
      if (synced) {
        toast.success(`Expense status updated to ${status}`);
      } else {
        toast.warning(`Expense status updated locally but failed to sync to database`);
      }
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    // Optimistically update the UI
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id 
          ? updatedExpense 
          : expense
      )
    );
    
    // Sync to database
    const synced = await syncExpenseToDatabase(updatedExpense);
    
    if (synced) {
      toast.success("Expense updated successfully");
    } else {
      toast.warning("Expense updated locally but failed to sync to database");
    }
  };

  const deleteExpense = async (expenseId: string) => {
    // Delete locally first
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    
    // Delete from database
    const deleted = await deleteExpenseFromDatabase(expenseId);
    
    if (deleted) {
      toast.success("Expense deleted successfully");
    }
  };

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    console.log("Saving expenses to localStorage:", expenses.length);
    if (expenses.length > 0) {
      safelyStoreExpenses(expenses);
    }
  }, [expenses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      addExpense, 
      updateExpenseStatus,
      deleteExpense,
      getTotalExpenses: expenseData.getTotalExpenses,
      getExpensesByCategory: expenseData.getExpensesByCategory,
      updateExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
