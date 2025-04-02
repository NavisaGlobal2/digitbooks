
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export type CashflowDataPoint = {
  name: string;
  inflow: number;
  outflow: number;
  netFlow: number;
};

export const useCashflowData = (monthsToShow = 6) => {
  const [data, setData] = useState<CashflowDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCashflowData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const currentDate = new Date();
        const startDate = startOfMonth(subMonths(currentDate, monthsToShow - 1));
        const endDate = endOfMonth(currentDate);
        
        // Format dates for database queries
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();

        // Fetch revenues
        const { data: revenues, error: revenueError } = await supabase
          .from('revenues')
          .select('amount, date')
          .gte('date', startStr)
          .lte('date', endStr);
          
        if (revenueError) throw revenueError;

        // Fetch expenses
        const { data: expenses, error: expenseError } = await supabase
          .from('expenses')
          .select('amount, date')
          .gte('date', startStr)
          .lte('date', endStr);
          
        if (expenseError) throw expenseError;

        // Group data by month
        const monthlyData: Record<string, CashflowDataPoint> = {};
        
        // Initialize the months we want to display
        for (let i = 0; i < monthsToShow; i++) {
          const month = subMonths(currentDate, monthsToShow - 1 - i);
          const monthKey = format(month, 'yyyy-MM');
          const monthName = format(month, 'MMM');
          
          monthlyData[monthKey] = {
            name: monthName,
            inflow: 0,
            outflow: 0,
            netFlow: 0,
          };
        }
        
        // Process revenues
        revenues?.forEach(revenue => {
          const date = new Date(revenue.date);
          const monthKey = format(date, 'yyyy-MM');
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].inflow += Number(revenue.amount);
          }
        });
        
        // Process expenses
        expenses?.forEach(expense => {
          const date = new Date(expense.date);
          const monthKey = format(date, 'yyyy-MM');
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].outflow += Number(expense.amount);
          }
        });
        
        // Calculate net flow and convert to array
        const result = Object.values(monthlyData).map(item => ({
          ...item,
          netFlow: item.inflow - item.outflow
        }));
        
        setData(result);
      } catch (error) {
        console.error("Error fetching cashflow data:", error);
        setError("Failed to load cashflow data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashflowData();
  }, [monthsToShow]);

  return { data, isLoading, error };
};
