
import { supabase } from "@/integrations/supabase/client";

// Fetch revenue from the revenues table
export const fetchRevenue = async (startDate: string, endDate: string, sources?: string[]) => {
  try {
    let query = supabase
      .from('revenues')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (sources && sources.length > 0) {
      query = query.in('source', sources);
    }

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

// Fetch revenue from invoices
export const fetchInvoiceRevenue = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .gte('issued_date', startDate)
      .lte('issued_date', endDate)
      .eq('status', 'paid');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return [];
  }
};

// Fetch expenses
export const fetchExpenses = async (startDate: string, endDate: string, categories?: string[]) => {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching expense data:", error);
    return [];
  }
};
