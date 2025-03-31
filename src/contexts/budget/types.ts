
import { Json } from "@/integrations/supabase/types";

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

export interface Budget {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  categories: BudgetCategory[];
}

export interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  loading: boolean;
}
