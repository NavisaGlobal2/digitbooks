
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

// Predefined colors for chart segments
const chartColors = [
  "#10B981", // green
  "#F87171", // red
  "#1E293B", // dark blue
  "#93C5FD", // light blue
  "#9CA3AF", // gray
  "#8B5CF6", // purple
  "#FCD34D", // yellow
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
];

export const useFinancialBreakdown = (period: string = "Last six months") => {
  const [expenseData, setExpenseData] = useState<ChartDataItem[]>([]);
  const [revenueData, setRevenueData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);
      
      try {
        // Determine date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        if (period.includes("month")) {
          // Extract number of months if period is like "Last six months"
          const months = parseInt(period.match(/\d+/)?.[0] || "6");
          startDate.setMonth(startDate.getMonth() - months);
        } else {
          // Handle specific month/year format (e.g., "Jan 2023")
          const dateObj = new Date(period);
          if (!isNaN(dateObj.getTime())) {
            startDate.setFullYear(dateObj.getFullYear(), dateObj.getMonth(), 1);
            endDate.setFullYear(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
          } else {
            // Default to last 6 months if format is not recognized
            startDate.setMonth(startDate.getMonth() - 6);
          }
        }

        // Format dates for database queries
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();

        // Fetch expense data by category
        const { data: expensesByCategory, error: expensesError } = await supabase
          .from('expenses')
          .select('category, amount')
          .eq('user_id', user.id)
          .gte('date', startStr)
          .lte('date', endStr);

        if (expensesError) throw expensesError;

        // Fetch revenue data by source
        const { data: revenuesBySource, error: revenuesError } = await supabase
          .from('revenues')
          .select('source, amount')
          .eq('user_id', user.id)
          .gte('date', startStr)
          .lte('date', endStr);

        if (revenuesError) throw revenuesError;

        // Process expenses by category
        const expensesMap = new Map<string, number>();
        expensesByCategory?.forEach(expense => {
          const category = expense.category || 'Uncategorized';
          expensesMap.set(category, (expensesMap.get(category) || 0) + Number(expense.amount));
        });

        // Process revenues by source
        const revenuesMap = new Map<string, number>();
        revenuesBySource?.forEach(revenue => {
          const source = revenue.source || 'Uncategorized';
          revenuesMap.set(source, (revenuesMap.get(source) || 0) + Number(revenue.amount));
        });

        // Calculate totals
        const totalExpenses = Array.from(expensesMap.values()).reduce((sum, amount) => sum + amount, 0);
        const totalRevenue = Array.from(revenuesMap.values()).reduce((sum, amount) => sum + amount, 0);

        // Format expense data
        const formattedExpenses: ChartDataItem[] = Array.from(expensesMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([category, amount], index) => ({
            name: category,
            value: amount,
            percentage: totalExpenses > 0 ? `${((amount / totalExpenses) * 100).toFixed(1)}%` : "0%",
            color: chartColors[index % chartColors.length]
          }));

        // Format revenue data
        const formattedRevenues: ChartDataItem[] = Array.from(revenuesMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([source, amount], index) => ({
            name: source,
            value: amount,
            percentage: totalRevenue > 0 ? `${((amount / totalRevenue) * 100).toFixed(1)}%` : "0%",
            color: chartColors[index % chartColors.length]
          }));

        setExpenseData(formattedExpenses);
        setRevenueData(formattedRevenues);
      } catch (err: any) {
        console.error("Error fetching financial breakdown data:", err);
        setError(err.message || "Failed to fetch financial data");
        toast.error("Failed to load financial breakdown data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [user, period]);

  return { expenseData, revenueData, isLoading, error };
};
