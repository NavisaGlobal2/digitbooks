
import { createContext, useContext, useState, ReactNode } from "react";

interface Budget {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  categories: BudgetCategory[];
}

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface BudgetContextValue {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addBudget = (budget: Omit<Budget, "id">) => {
    const id = Math.random().toString(36).substring(2, 11);
    setBudgets((prev) => [...prev, { ...budget, id }]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget
      )
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, addBudget, updateBudget, deleteBudget }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};
