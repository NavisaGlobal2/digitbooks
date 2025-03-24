
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Revenue } from "@/types/revenue";

interface RevenueContextType {
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id">) => void;
  updateRevenue: (id: string, revenue: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;
  getTotalRevenue: () => number;
  getRevenueBySource: () => Record<string, number>;
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

  return (
    <RevenueContext.Provider
      value={{
        revenues,
        addRevenue,
        updateRevenue,
        deleteRevenue,
        getTotalRevenue,
        getRevenueBySource,
      }}
    >
      {children}
    </RevenueContext.Provider>
  );
};
