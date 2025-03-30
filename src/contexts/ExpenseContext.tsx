
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { useExpenseData } from '@/hooks/useExpenseData';
import { safelyStoreExpenses, loadExpensesFromLocalStorage } from '@/utils/expenseStorage';
import { useExpenseDatabase } from '@/hooks/useExpenseDatabase';

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
          setExpenses(dbExpenses);
        } else {
          // Fallback to local storage if no database expenses found
          const localExpenses = loadExpensesFromLocalStorage();
          
          if (localExpenses) {
            setExpenses(localExpenses);
            
            // If user is authenticated, sync local expenses to database
            if (currentUserId && localExpenses.length > 0) {
              syncLocalExpensesToDatabase(localExpenses);
            }
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
    await addExpensesBatch(localExpenses);
  };

  // Add a single expense
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    
    const result = await dbAddExpense(newExpense);
    toast[result.success ? 'success' : 'warning'](result.message);
  };

  // Add multiple expenses
  const addExpenses = async (expensesData: Omit<Expense, 'id'>[]) => {
    const newExpenses: Expense[] = expensesData.map(expenseData => ({
      ...expenseData,
      id: crypto.randomUUID(),
    }));
    
    setExpenses(prev => [...newExpenses, ...prev]);
    
    const result = await addExpensesBatch(newExpenses);
    toast[result.success ? 'success' : 'warning'](result.message);
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
      const result = await dbUpdateExpenseStatus(expense, status);
      toast[result.success ? 'success' : 'warning'](result.message);
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
    
    const result = await dbUpdateExpense(updatedExpense);
    toast[result.success ? 'success' : 'warning'](result.message);
  };

  // Delete expense
  const deleteExpense = async (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    
    const result = await dbDeleteExpense(expenseId);
    if (result.success) {
      toast.success(result.message);
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
