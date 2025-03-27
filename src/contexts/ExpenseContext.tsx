
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
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from database and localStorage on initial load
  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      
      try {
        // First try to load from Supabase
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
          }));
          
          setExpenses(formattedExpenses);
        } else {
          // Fallback to localStorage if no database expenses
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
            
            // If we loaded from localStorage, sync them to Supabase
            processedExpenses.forEach(async (expense: Expense) => {
              await syncExpenseToDatabase(expense);
            });
          }
        }
      } catch (error) {
        console.error("Failed to load expenses:", error);
        
        // Final fallback to localStorage
        try {
          const storedExpenses = localStorage.getItem('expenses');
          if (storedExpenses) {
            const parsedExpenses = JSON.parse(storedExpenses);
            const processedExpenses = parsedExpenses.map((expense: any) => ({
              ...expense,
              date: new Date(expense.date),
              receiptUrl: expense.receiptUrl || null
            }));
            
            console.log("Fallback: Loaded expenses from localStorage:", processedExpenses.length);
            setExpenses(processedExpenses);
          }
        } catch (localError) {
          console.error("Failed to parse stored expenses:", localError);
          toast.error("Failed to load your saved expenses");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExpenses();
  }, []);

  // Sync expense to database
  const syncExpenseToDatabase = async (expense: Expense) => {
    try {
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
        from_statement: expense.fromStatement || false
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
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) {
        console.error("Failed to delete expense from database:", error);
        toast.error("Failed to delete expense from database");
      } else {
        toast.success("Expense deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense from database");
    }
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
      getTotalExpenses,
      getExpensesByCategory,
      updateExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
