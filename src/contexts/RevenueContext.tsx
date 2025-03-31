
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Revenue, PaymentStatus } from "@/types/revenue";

interface RevenueContextType {
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id">) => void;
  updateRevenue: (id: string, revenue: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;
  getTotalRevenue: () => number;
  getRevenueBySource: () => Record<string, number>;
  getRevenueByStatus: () => Record<PaymentStatus, number>;
  importRevenues: (revenues: Omit<Revenue, "id">[]) => void;
  getRevenueByPeriod: (startDate: Date, endDate: Date) => Revenue[];
  getTotalReceivables: () => number;
  getOutstandingReceivables: () => number;
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
  const [revenues, setRevenues] = useState<Revenue[]>(() => {
    // Load from localStorage if available
    const savedRevenues = localStorage.getItem("revenues");
    return savedRevenues ? JSON.parse(savedRevenues) : [];
  });

  // Save to localStorage when revenues change
  useEffect(() => {
    localStorage.setItem("revenues", JSON.stringify(revenues));
  }, [revenues]);

  const addRevenue = (revenue: Omit<Revenue, "id">) => {
    const newRevenue = {
      ...revenue,
      id: crypto.randomUUID(),
    };
    setRevenues([...revenues, newRevenue]);
  };

  // Add this function to import multiple revenues at once
  const importRevenues = (revenueItems: Omit<Revenue, "id">[]) => {
    const newRevenues = revenueItems.map(revenue => ({
      ...revenue,
      id: crypto.randomUUID(),
    }));
    
    setRevenues(prevRevenues => [...prevRevenues, ...newRevenues]);
  };

  const updateRevenue = (id: string, revenueUpdates: Partial<Revenue>) => {
    setRevenues(
      revenues.map((revenue) =>
        revenue.id === id ? { ...revenue, ...revenueUpdates } : revenue
      )
    );
  };

  const deleteRevenue = (id: string) => {
    setRevenues(revenues.filter((revenue) => revenue.id !== id));
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
      statusTotals[revenue.paymentStatus] += revenue.amount;
    });
    
    return statusTotals;
  };

  // New method to get revenues for a specific time period
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
      if (revenue.paymentStatus === 'pending' || revenue.paymentStatus === 'overdue') {
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
      }}
    >
      {children}
    </RevenueContext.Provider>
  );
};
