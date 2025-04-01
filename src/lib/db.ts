
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Invoice hook
export const useInvoices = () => {
  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
      return [];
    }
  };

  return { fetchInvoices };
};

// Expenses hook
export const useExpenses = () => {
  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
      return [];
    }
  };

  return { fetchExpenses };
};

// Revenues hook
export const useRevenues = () => {
  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching revenues:", error);
      toast.error("Failed to load revenues");
      return [];
    }
  };

  return { fetchRevenues };
};
