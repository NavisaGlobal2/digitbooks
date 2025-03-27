
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_default?: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const useTaxRates = () => {
  const fetchTaxRates = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tax rates:", error);
      toast.error("Failed to load tax rates");
      return [];
    }
  };

  const createTaxRate = async (taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a tax rate");
        return null;
      }

      const { data, error } = await supabase
        .from('tax_rates')
        .insert({ ...taxRate, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Tax rate created successfully");
      return data;
    } catch (error) {
      console.error("Error creating tax rate:", error);
      toast.error("Failed to create tax rate");
      return null;
    }
  };

  const updateTaxRate = async (id: string, taxRate: Partial<Omit<TaxRate, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .update({ ...taxRate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Tax rate updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating tax rate:", error);
      toast.error("Failed to update tax rate");
      return null;
    }
  };

  const deleteTaxRate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_rates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Tax rate deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting tax rate:", error);
      toast.error("Failed to delete tax rate");
      return false;
    }
  };

  return {
    fetchTaxRates,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate
  };
};
