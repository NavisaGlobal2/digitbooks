
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Revenue, PaymentStatus, mapDbToRevenue, mapRevenueToDb, RevenueDB } from "@/types/revenue";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface RevenueContextType {
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id">) => Promise<void>;
  updateRevenue: (id: string, revenue: Partial<Revenue>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  getTotalRevenue: () => number;
  getRevenueBySource: () => Record<string, number>;
  getRevenueByStatus: () => Record<PaymentStatus, number>;
  importRevenues: (revenues: Omit<Revenue, "id">[]) => Promise<void>;
  getRevenueByPeriod: (startDate: Date, endDate: Date) => Revenue[];
  getTotalReceivables: () => number;
  getOutstandingReceivables: () => number;
  loading: boolean;
}

const RevenueContext = createContext<RevenueContextType | undefined>(undefined);

export const useRevenue = () => {
  const context = useContext(RevenueContext);
  if (!context) {
    throw new Error("useRevenue must be used within a RevenueProvider");
  }
  return context;
};

interface RevenueProviderProps {
  children: ReactNode;
}

export const RevenueProvider = ({ children }: RevenueProviderProps) => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('revenues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const transformedRevenues: Revenue[] = data.map(item => mapDbToRevenue(item as RevenueDB));
        setRevenues(transformedRevenues);
      }
    } catch (error) {
      console.error("Error fetching revenues:", error);
      toast.error("Failed to load revenues");
    } finally {
      setLoading(false);
    }
  };

  const addRevenue = async (revenue: Omit<Revenue, "id">) => {
    try {
      setLoading(true);
      
      const revenueNumber = revenue.revenue_number || `REV-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const revenueData = mapRevenueToDb({
        ...revenue,
        revenue_number: revenueNumber,
        client_name: revenue.client_name || "",
      });
      
      const { data, error } = await supabase
        .from('revenues')
        .insert([revenueData])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newRevenue: Revenue = mapDbToRevenue(data[0] as RevenueDB);
        setRevenues(prev => [newRevenue, ...prev]);
      }
      
      return;
    } catch (error) {
      console.error("Error adding revenue:", error);
      toast.error("Failed to add revenue");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const importRevenues = async (revenueItems: Omit<Revenue, "id">[]) => {
    try {
      setLoading(true);
      
      // Get current authenticated user first
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error("Auth error:", authError);
        toast.error("Authentication error. Please sign in again.");
        return;
      }
      
      const userId = authData.user.id;
      
      const revenuesWithNumbers = revenueItems.map(revenue => ({
        ...mapRevenueToDb({
          ...revenue,
          revenue_number: `REV-${uuidv4().substring(0, 8).toUpperCase()}`,
          client_name: revenue.client_name || "",
        }),
        user_id: userId // Explicitly set user_id for each revenue record
      }));
      
      console.log("Mapped revenues for database insertion:", revenuesWithNumbers);
      
      const { data, error } = await supabase
        .from('revenues')
        .insert(revenuesWithNumbers)
        .select();
      
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Successfully inserted revenue data:", data);
        const newRevenues: Revenue[] = data.map(item => mapDbToRevenue(item as RevenueDB));
        setRevenues(prev => [...newRevenues, ...prev]);
        toast.success(`Successfully imported ${data.length} revenue entries`);
      } else {
        console.warn("No data returned from insert operation");
      }
      
    } catch (error) {
      console.error("Error importing revenues:", error);
      toast.error(`Failed to import revenues: ${error.message || "Unknown error"}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRevenue = async (id: string, revenueUpdates: Partial<Revenue>) => {
    try {
      setLoading(true);
      
      const updates: any = {};
      if (revenueUpdates.description) updates.description = revenueUpdates.description;
      if (revenueUpdates.amount) updates.amount = revenueUpdates.amount;
      if (revenueUpdates.date) updates.date = revenueUpdates.date.toISOString();
      if (revenueUpdates.source) updates.source = revenueUpdates.source;
      if (revenueUpdates.notes !== undefined) updates.notes = revenueUpdates.notes;
      if (revenueUpdates.payment_method) updates.payment_method = revenueUpdates.payment_method;
      if (revenueUpdates.payment_status) {
        updates.payment_status = revenueUpdates.payment_status;
        updates.status = revenueUpdates.payment_status;
      }
      if (revenueUpdates.client_name !== undefined) updates.client_name = revenueUpdates.client_name;
      if (revenueUpdates.revenue_number) updates.revenue_number = revenueUpdates.revenue_number;
      
      const { data, error } = await supabase
        .from('revenues')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const updatedRevenue: Revenue = mapDbToRevenue(data[0] as RevenueDB);
        
        setRevenues(prev =>
          prev.map(revenue => revenue.id === id ? updatedRevenue : revenue)
        );
      }
      
    } catch (error) {
      console.error("Error updating revenue:", error);
      toast.error("Failed to update revenue");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRevenue = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
      
    } catch (error) {
      console.error("Error deleting revenue:", error);
      toast.error("Failed to delete revenue");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return revenues.reduce((total, revenue) => total + revenue.amount, 0);
  };

  const getRevenueBySource = () => {
    return revenues.reduce((acc, revenue) => {
      const source = revenue.source;
      if (!acc[source]) {
        acc[source] = 0;
      }
      acc[source] += revenue.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getRevenueByStatus = () => {
    const statusTotals: Record<PaymentStatus, number> = {
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0
    };
    
    revenues.forEach(revenue => {
      statusTotals[revenue.payment_status] += revenue.amount;
    });
    
    return statusTotals;
  };

  const getRevenueByPeriod = (startDate: Date, endDate: Date) => {
    return revenues.filter(revenue => {
      const revenueDate = revenue.date instanceof Date ? revenue.date : new Date(revenue.date);
      return revenueDate >= startDate && revenueDate <= endDate;
    });
  };

  const getTotalReceivables = () => {
    return revenues.reduce((total, revenue) => total + revenue.amount, 0);
  };

  const getOutstandingReceivables = () => {
    return revenues.reduce((total, revenue) => {
      if (revenue.payment_status === 'pending' || revenue.payment_status === 'overdue') {
        return total + revenue.amount;
      }
      return total;
    }, 0);
  };

  return (
    <RevenueContext.Provider
      value={{
        revenues,
        addRevenue,
        updateRevenue,
        deleteRevenue,
        getTotalRevenue,
        getRevenueBySource,
        getRevenueByStatus,
        importRevenues,
        getRevenueByPeriod,
        getTotalReceivables,
        getOutstandingReceivables,
        loading
      }}
    >
      {children}
    </RevenueContext.Provider>
  );
};
