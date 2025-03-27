
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BankAccount = {
  id: string;
  name: string;
  account_number?: string;
  bank_name?: string;
  account_type?: string;
  balance?: number;
  currency?: string;
  is_active?: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const useBankAccounts = () => {
  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast.error("Failed to load bank accounts");
      return [];
    }
  };

  const createBankAccount = async (bankAccount: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a bank account");
        return null;
      }

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ ...bankAccount, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Bank account created successfully");
      return data;
    } catch (error) {
      console.error("Error creating bank account:", error);
      toast.error("Failed to create bank account");
      return null;
    }
  };

  const updateBankAccount = async (id: string, bankAccount: Partial<Omit<BankAccount, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({ ...bankAccount, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Bank account updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating bank account:", error);
      toast.error("Failed to update bank account");
      return null;
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Bank account deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error("Failed to delete bank account");
      return false;
    }
  };

  return {
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount
  };
};
