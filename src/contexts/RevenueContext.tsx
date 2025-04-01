
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Revenue, PaymentStatus } from "@/types/revenue";
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

  // Fetch revenues from Supabase when component mounts
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
      
      // Transform the data from Supabase to match our Revenue type
      const transformedRevenues: Revenue[] = data.map(item => ({
        ...item,
        date: new Date(item.date),
        created_at: item.created_at ? new Date(item.created_at) : undefined,
        // Map status to payment_status if needed
        payment_status: item.payment_status || item.status,
        // Ensure source is a valid RevenueSource
        source: item.source || 'other',
      }));
      
      setRevenues(transformedRevenues);
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
      
      // Generate a revenue number if not provided
      const revenueNumber = revenue.revenue_number || `REV-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Prepare the data for Supabase
      const revenueData = {
        ...revenue,
        revenue_number: revenueNumber,
        // Convert date objects to ISO strings for Supabase
        date: revenue.date.toISOString(),
        created_at: new Date().toISOString(),
        // Map fields if coming from old code
        status: revenue.payment_status
      };
      
      const { data, error } = await supabase
        .from('revenues')
        .insert([revenueData])
        .select();
      
      if (error) throw error;
      
      // Add the new revenue to the local state
      if (data && data[0]) {
        const newRevenue: Revenue = {
          ...data[0],
          date: new Date(data[0].date),
          created_at: data[0].created_at ? new Date(data[0].created_at) : undefined
        };
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
      
      // Prepare revenues with revenue numbers and ISO date strings
      const revenuesWithNumbers = revenueItems.map(revenue => ({
        ...revenue,
        revenue_number: `REV-${uuidv4().substring(0, 8).toUpperCase()}`,
        date: revenue.date.toISOString(),
        created_at: new Date().toISOString(),
        // Map fields if needed
        status: revenue.payment_status
      }));
      
      const { data, error } = await supabase
        .from('revenues')
        .insert(revenuesWithNumbers)
        .select();
      
      if (error) throw error;
      
      // Add the new revenues to the local state
      if (data && data.length > 0) {
        const newRevenues: Revenue[] = data.map(item => ({
          ...item,
          date: new Date(item.date),
          created_at: item.created_at ? new Date(item.created_at) : undefined
        }));
        setRevenues(prev => [...newRevenues, ...prev]);
      }
      
    } catch (error) {
      console.error("Error importing revenues:", error);
      toast.error("Failed to import revenues");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRevenue = async (id: string, revenueUpdates: Partial<Revenue>) => {
    try {
      setLoading(true);
      
      // Prepare updates for Supabase
      const updates = { 
        ...revenueUpdates,
        // Convert Date objects to ISO strings
        date: revenueUpdates.date ? revenueUpdates.date.toISOString() : undefined,
        created_at: revenueUpdates.created_at ? revenueUpdates.created_at.toISOString() : undefined,
        // Map fields if needed
        status: revenueUpdates.payment_status || undefined
      };
      
      const { data, error } = await supabase
        .from('revenues')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the revenue in local state
      if (data && data[0]) {
        const updatedRevenue: Revenue = {
          ...data[0],
          date: new Date(data[0].date),
          created_at: data[0].created_at ? new Date(data[0].created_at) : undefined
        };
        
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
      
      // Remove the revenue from local state
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

  // Get revenues for a specific time period
  const getRevenueByPeriod = (startDate: Date, endDate: Date) => {
    return revenues.filter(revenue => {
      const revenueDate = revenue.date instanceof Date ? revenue.date : new Date(revenue.date);
      return revenueDate >= startDate && revenueDate <= endDate;
    });
  };

  // Get total receivables (all invoiced revenue)
  const getTotalReceivables = () => {
    return revenues.reduce((total, revenue) => total + revenue.amount, 0);
  };

  // Get outstanding receivables (pending + overdue)
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
