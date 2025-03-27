
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PaymentMethod = {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export const usePaymentMethods = () => {
  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods");
      return [];
    }
  };

  const createPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(paymentMethod)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Payment method created successfully");
      return data;
    } catch (error) {
      console.error("Error creating payment method:", error);
      toast.error("Failed to create payment method");
      return null;
    }
  };

  const updatePaymentMethod = async (id: string, paymentMethod: Partial<Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update({ ...paymentMethod, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Payment method updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method");
      return null;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Payment method deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to delete payment method");
      return false;
    }
  };

  return {
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  };
};
