
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, ExpenseStatus } from '@/types/expense';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

const safelyStoreExpenses = (expenses: Expense[]): boolean => {
  try {
    const storableExpenses = expenses.map(expense => {
      const expenseCopy = {...expense};
      
      if (expenseCopy.receiptUrl) {
        expenseCopy.hasReceipt = true;
      }
      
      return {
        ...expenseCopy,
        date: expense.date instanceof Date ? expense.date.toISOString() : String(expense.date)
      };
    });
    
    localStorage.setItem('expenses', JSON.stringify(storableExpenses));
    return true;
  } catch (error) {
    console.error("Failed to store expenses in localStorage:", error);
    
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const limitedExpenses = expenses.slice(0, 50).map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date instanceof Date ? expense.date.toISOString() : String(expense.date),
          category: expense.category,
          status: expense.status,
          paymentMethod: expense.paymentMethod,
          vendor: expense.vendor,
          receiptUrl: expense.receiptUrl,
          hasReceipt: !!expense.receiptUrl
        }));
        
        localStorage.setItem('expenses', JSON.stringify(limitedExpenses));
        toast.warning("Some expense data couldn't be stored locally due to size limits");
        return true;
      } catch (fallbackError) {
        console.error("Failed to store limited expenses:", fallbackError);
        toast.error("Failed to save your expenses. Please export them if needed.");
        return false;
      }
    }
    toast.error("Failed to save your expenses. Please export them if needed.");
    return false;
  }
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        
        const processedExpenses = parsedExpenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
          receiptUrl: expense.receiptUrl || null
        }));
        
        console.log("Loaded expenses from localStorage:", processedExpenses.length);
        setExpenses(processedExpenses);
      }
    } catch (error) {
      console.error("Failed to parse stored expenses:", error);
      toast.error("Failed to load your saved expenses");
    }
  }, []);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    console.log("Adding new expense:", expenseData);
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    toast.success("Expense added successfully");
  };

  const updateExpenseStatus = (expenseId: string, status: ExpenseStatus) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status } 
          : expense
      )
    );
    toast.success(`Expense status updated to ${status}`);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id 
          ? updatedExpense 
          : expense
      )
    );
    toast.success("Expense updated successfully");
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  useEffect(() => {
    console.log("Saving expenses to localStorage:", expenses.length);
    if (expenses.length > 0) {
      safelyStoreExpenses(expenses);
    }
  }, [expenses]);

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      addExpense, 
      updateExpenseStatus,
      deleteExpense,
      getTotalExpenses,
      getExpensesByCategory,
      updateExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
