
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseData } from '@/hooks/useExpenseData';
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
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
      }
    };
    
    if (currentUserId) {
      fetchExpenses();
    } else {
      // Clear expenses when no user is logged in
      setExpenses([]);
    }
  }, [currentUserId]);

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
      toast.error("Failed to save expense to database");
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
      toast.error("Failed to save expenses to database");
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
        toast.error("Failed to update expense status in database");
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
      toast.error("Failed to update expense in database");
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
      toast.error("Failed to delete expense from database");
    }
  };

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
