
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface BudgetContextValue {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  loading: boolean;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch budgets from database on component mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("budgets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          // Transform the data from database format to our Budget type
          const transformedBudgets: Budget[] = data.map(item => ({
            id: item.id,
            name: item.name,
            startDate: new Date(item.start_date),
            endDate: new Date(item.end_date),
            totalBudget: item.total_budget,
            // Ensure categories are parsed as BudgetCategory[] or default to empty array if null/invalid
            categories: Array.isArray(item.items) ? item.items : []
          }));

          setBudgets(transformedBudgets);
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
        toast.error("Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const addBudget = async (budget: Omit<Budget, "id">) => {
    try {
      // Get the user ID from the authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error("No authenticated user found");
      }

      // Convert the Budget object to the database format
      const dbBudget = {
        name: budget.name,
        start_date: budget.startDate.toISOString(),
        end_date: budget.endDate.toISOString(),
        total_budget: budget.totalBudget,
        items: budget.categories,
        status: "active",
        total_spent: 0,
        user_id: userId // Add the required user_id field
      };

      const { data, error } = await supabase
        .from("budgets")
        .insert(dbBudget)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBudget: Budget = {
          id: data.id,
          name: data.name,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          totalBudget: data.total_budget,
          // Ensure categories are parsed as BudgetCategory[] or default to empty array
          categories: Array.isArray(data.items) ? data.items : []
        };

        setBudgets((prev) => [...prev, newBudget]);
        toast.success("Budget created successfully");
      }
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Failed to create budget");
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      // Convert the updates to the database format
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.startDate) dbUpdates.start_date = updates.startDate.toISOString();
      if (updates.endDate) dbUpdates.end_date = updates.endDate.toISOString();
      if (updates.totalBudget) dbUpdates.total_budget = updates.totalBudget;
      if (updates.categories) dbUpdates.items = updates.categories;

      // Calculate total spent from categories if available
      if (updates.categories) {
        const totalSpent = updates.categories.reduce((sum, cat) => sum + cat.spent, 0);
        dbUpdates.total_spent = totalSpent;
      }

      const { error } = await supabase
        .from("budgets")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;

      setBudgets((prev) =>
        prev.map((budget) =>
          budget.id === id ? { ...budget, ...updates } : budget
        )
      );
      
      toast.success("Budget updated successfully");
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBudgets((prev) => prev.filter((budget) => budget.id !== id));
      toast.success("Budget deleted successfully");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, addBudget, updateBudget, deleteBudget, loading }}
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
