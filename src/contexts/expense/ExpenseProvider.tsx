
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseData } from '@/hooks/useExpenseData';
import { safelyStoreExpenses, loadExpensesFromLocalStorage } from '@/utils/expenseStorage';
import { useExpenseDatabase } from '@/hooks/useExpenseDatabase';
import { ExpenseContextType } from './types';

// Create the context with undefined as initial value
export const ExpenseContext = React.createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const expenseData = useExpenseData(expenses);
  const { 
    isLoading, 
    loadExpenses, 
    addExpense: dbAddExpense,
    addExpensesBatch,
    updateExpense: dbUpdateExpense,
    updateExpenseStatus: dbUpdateExpenseStatus,
    deleteExpense: dbDeleteExpense,
    currentUserId
  } = useExpenseDatabase();

  // Load expenses on initial load
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const dbExpenses = await loadExpenses();
        
        if (dbExpenses && dbExpenses.length > 0) {
          console.log(`Loaded ${dbExpenses.length} expenses from database`);
          setExpenses(dbExpenses);
        } else {
          console.log('No expenses found in database, checking local storage');
          // Fallback to local storage if no database expenses found
          const localExpenses = loadExpensesFromLocalStorage();
          
          if (localExpenses && localExpenses.length > 0) {
            console.log(`Loaded ${localExpenses.length} expenses from local storage`);
            setExpenses(localExpenses);
            
            // If user is authenticated, sync local expenses to database
            if (currentUserId && localExpenses.length > 0) {
              console.log(`Syncing ${localExpenses.length} local expenses to database`);
              syncLocalExpensesToDatabase(localExpenses);
            }
          } else {
            console.log('No expenses found in local storage either');
          }
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
        
        // Fallback to local storage on error
        const localExpenses = loadExpensesFromLocalStorage();
        if (localExpenses) {
          setExpenses(localExpenses);
        }
      }
    };
    
    fetchExpenses();
  }, [currentUserId]);

  // Sync local expenses to database when user is authenticated
  const syncLocalExpensesToDatabase = async (localExpenses: Expense[]) => {
    try {
      const result = await addExpensesBatch(localExpenses);
      console.log(`Synced ${result.syncedCount} of ${localExpenses.length} expenses to database`);
    } catch (error) {
      console.error("Failed to sync local expenses to database:", error);
    }
  };

  // Add a single expense
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    
    console.log('Adding new expense:', newExpense);
    setExpenses(prev => [newExpense, ...prev]);
    
    try {
      const result = await dbAddExpense(newExpense);
      console.log('Database add expense result:', result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
        console.warn('Database sync issue:', result.message);
      }
    } catch (error) {
      console.error("Failed to save expense to database:", error);
      toast.error("Expense saved locally but failed to sync with database");
    }
  };

  // Add multiple expenses
  const addExpenses = async (expensesData: Omit<Expense, 'id'>[]) => {
    const newExpenses: Expense[] = expensesData.map(expenseData => ({
      ...expenseData,
      id: crypto.randomUUID(),
    }));
    
    console.log(`Adding ${newExpenses.length} new expenses`);
    setExpenses(prev => [...newExpenses, ...prev]);
    
    try {
      const result = await addExpensesBatch(newExpenses);
      console.log('Database add expenses batch result:', result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    } catch (error) {
      console.error("Failed to save expenses batch to database:", error);
      toast.error("Expenses saved locally but failed to sync with database");
    }
  };

  // Update expense status
  const updateExpenseStatus = async (expenseId: string, status: ExpenseStatus) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status } 
          : expense
      )
    );
    
    const expense = expenses.find(e => e.id === expenseId);
    
    if (expense) {
      try {
        const result = await dbUpdateExpenseStatus(expense, status);
        console.log('Database update expense status result:', result);
        
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.warning(result.message);
        }
      } catch (error) {
        console.error("Failed to update expense status in database:", error);
        toast.error("Status updated locally but failed to sync with database");
      }
    }
  };

  // Update expense
  const updateExpense = async (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id 
          ? updatedExpense 
          : expense
      )
    );
    
    try {
      const result = await dbUpdateExpense(updatedExpense);
      console.log('Database update expense result:', result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    } catch (error) {
      console.error("Failed to update expense in database:", error);
      toast.error("Expense updated locally but failed to sync with database");
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    
    try {
      const result = await dbDeleteExpense(expenseId);
      console.log('Database delete expense result:', result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to delete expense from database:", error);
      toast.error("Expense removed locally but failed to sync with database");
    }
  };

  // Store expenses in local storage when they change
  useEffect(() => {
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
      addExpenses,
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
