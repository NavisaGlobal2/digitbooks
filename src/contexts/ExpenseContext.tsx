import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseSync } from '@/hooks/useExpenseSync';
import { useExpenseData } from '@/hooks/useExpenseData';
import { safelyStoreExpenses, loadExpensesFromLocalStorage } from '@/utils/expenseStorage';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addExpenses: (expenses: Omit<Expense, 'id'>[]) => void;
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

  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      
      try {
        const dbExpenses = await loadExpensesFromSupabase();
        
        if (dbExpenses && dbExpenses.length > 0) {
          setExpenses(dbExpenses);
        } else {
          const localExpenses = loadExpensesFromLocalStorage();
          
          if (localExpenses) {
            setExpenses(localExpenses);
            
            if (currentUserId) {
              localExpenses.forEach(async (expense: Expense) => {
                await syncExpenseToDatabase(expense);
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
        
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
    
    setExpenses(prev => [newExpense, ...prev]);
    
    const synced = await syncExpenseToDatabase(newExpense);
    
    if (synced) {
      toast.success("Expense added successfully");
    } else {
      toast.success("Expense added locally but failed to sync to database");
    }
  };

  const addExpenses = async (expensesData: Omit<Expense, 'id'>[]) => {
    console.log(`Adding ${expensesData.length} new expenses from batch import`);
    
    const newExpenses: Expense[] = expensesData.map(expenseData => ({
      ...expenseData,
      id: crypto.randomUUID(),
    }));
    
    setExpenses(prev => [...newExpenses, ...prev]);
    
    let syncedCount = 0;
    for (const expense of newExpenses) {
      const synced = await syncExpenseToDatabase(expense);
      if (synced) syncedCount++;
    }
    
    if (syncedCount === newExpenses.length) {
      toast.success(`${newExpenses.length} expenses added successfully`);
    } else {
      toast.warning(`${syncedCount} of ${newExpenses.length} expenses synced to database`);
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: ExpenseStatus) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status } 
          : expense
      )
    );
    
    const updatedExpense = expenses.find(e => e.id === expenseId);
    
    if (updatedExpense) {
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
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id 
          ? updatedExpense 
          : expense
      )
    );
    
    const synced = await syncExpenseToDatabase(updatedExpense);
    
    if (synced) {
      toast.success("Expense updated successfully");
    } else {
      toast.warning("Expense updated locally but failed to sync to database");
    }
  };

  const deleteExpense = async (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    
    const deleted = await deleteExpenseFromDatabase(expenseId);
    
    if (deleted) {
      toast.success("Expense deleted successfully");
    }
  };

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
