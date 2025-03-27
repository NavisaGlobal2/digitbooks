
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date?: string;
  category_id?: string;
  transaction_type: 'expense' | 'revenue';
  bank_account_id?: string;
  next_due_date?: string;
  status?: 'active' | 'paused' | 'completed';
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const useRecurringTransactions = () => {
  const fetchRecurringTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
      toast.error("Failed to load recurring transactions");
      return [];
    }
  };

  const createRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a recurring transaction");
        return null;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Recurring transaction created successfully");
      return data;
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
      toast.error("Failed to create recurring transaction");
      return null;
    }
  };

  const updateRecurringTransaction = async (id: string, transaction: Partial<Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ ...transaction, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Recurring transaction updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating recurring transaction:", error);
      toast.error("Failed to update recurring transaction");
      return null;
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Recurring transaction deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Failed to delete recurring transaction");
      return false;
    }
  };

  return {
    fetchRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction
  };
};
