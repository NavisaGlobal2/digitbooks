
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

export const expenseDatabaseOperations = {
  syncExpense: async (expense: Expense, userId: string) => {
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
      batch_id: expense.batchId || null,
      user_id: userId
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
  },

  loadExpenses: async () => {
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
      return dbExpenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        receiptUrl: expense.receipt_url || null,
        paymentMethod: expense.payment_method,
        fromStatement: expense.from_statement,
        batchId: expense.batch_id || null
      }));
    }
    
    return null;
  },

  deleteExpense: async (expenseId: string) => {
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
  },
  
  searchExpenses: async (query: string) => {
    if (!query.trim()) {
      return await expenseDatabaseOperations.loadExpenses();
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .or(`description.ilike.%${query}%,vendor.ilike.%${query}%`)
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Failed to search expenses:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        receiptUrl: expense.receipt_url || null,
        paymentMethod: expense.payment_method,
        fromStatement: expense.from_statement,
        batchId: expense.batch_id || null
      }));
    }
    
    return [];
  },
  
  getExpensesByCategory: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount');
    
    if (error) {
      console.error("Failed to get expenses by category:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return {};
    }
    
    return data.reduce((acc: Record<string, number>, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});
  },
  
  getExpenseById: async (expenseId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();
    
    if (error) {
      console.error("Failed to get expense by ID:", error);
      return null;
    }
    
    if (data) {
      return {
        ...data,
        date: new Date(data.date),
        receiptUrl: data.receipt_url || null,
        paymentMethod: data.payment_method,
        fromStatement: data.from_statement,
        batchId: data.batch_id || null
      };
    }
    
    return null;
  }
};
