
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export type DateRange = "current-month" | "last-month" | "quarter" | "year" | "custom";

export interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  revenueBreakdown: RevenueBreakdown[];
  expenseBreakdown: ExpenseBreakdown[];
  monthlySummary: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export interface ReportFilters {
  dateRange: DateRange;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  sources?: string[];
}

export const useFinancialReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "current-month",
  });
  const [error, setError] = useState<string | null>(null);

  // Generate date range based on filter type
  const getDateRange = (filter: ReportFilters): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date();
    let start = new Date();

    if (filter.dateRange === "custom" && filter.startDate && filter.endDate) {
      return { start: filter.startDate, end: filter.endDate };
    }

    switch (filter.dateRange) {
      case "current-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "last-month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchFinancialData(filters);
  }, [filters]);

  // Update filters
  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Fetch all financial data
  const fetchFinancialData = async (reportFilters: ReportFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(reportFilters);
      
      // Format dates for database queries
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      // Fetch revenue from multiple sources
      const [revenueData, expenseData, invoiceData] = await Promise.all([
        fetchRevenue(startStr, endStr, reportFilters.sources),
        fetchExpenses(startStr, endStr, reportFilters.categories),
        fetchInvoiceRevenue(startStr, endStr)
      ]);

      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0) + 
                          invoiceData.reduce((sum, item) => sum + item.amount, 0);
      
      const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
      
      // For this implementation, assume COGS is 30% of revenue (replace with actual COGS calculation)
      const estimatedCOGS = totalRevenue * 0.3;
      const grossProfit = totalRevenue - estimatedCOGS;
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Prepare revenue breakdown by source
      const revenueBySource = new Map<string, number>();
      
      // Add regular revenue
      revenueData.forEach(item => {
        const source = item.source || 'other';
        revenueBySource.set(source, (revenueBySource.get(source) || 0) + item.amount);
      });
      
      // Add invoice revenue
      invoiceData.forEach(item => {
        revenueBySource.set('invoices', (revenueBySource.get('invoices') || 0) + item.amount);
      });

      const revenueBreakdown: RevenueBreakdown[] = Array.from(revenueBySource.entries()).map(([source, amount]) => ({
        source,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
      }));
      
      // Prepare expense breakdown by category
      const expenseByCategory = new Map<string, number>();
      
      expenseData.forEach(item => {
        const category = item.category || 'other';
        expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + item.amount);
      });

      const expenseBreakdown: ExpenseBreakdown[] = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }));
      
      // Generate monthly summary for charts
      const monthlySummary = generateMonthlySummary(start, end, revenueData, invoiceData, expenseData);

      // Set the financial summary
      setSummary({
        totalRevenue,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin,
        revenueBreakdown,
        expenseBreakdown,
        monthlySummary
      });

    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError("Failed to load financial data. Please try again.");
      toast.error("Failed to load financial reports data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch revenue from the revenues table
  const fetchRevenue = async (startDate: string, endDate: string, sources?: string[]) => {
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
  const fetchInvoiceRevenue = async (startDate: string, endDate: string) => {
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
  const fetchExpenses = async (startDate: string, endDate: string, categories?: string[]) => {
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

  // Generate monthly summary data for charts
  const generateMonthlySummary = (
    start: Date,
    end: Date,
    revenueData: any[],
    invoiceData: any[],
    expenseData: any[]
  ) => {
    // Create a map to store monthly data
    const monthlyData = new Map();
    
    // Create entries for each month in the range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = format(currentDate, 'yyyy-MM');
      const monthLabel = format(currentDate, 'MMM yyyy');
      
      monthlyData.set(monthKey, {
        month: monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Add revenue data
    revenueData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.revenue += item.amount;
      }
    });
    
    // Add invoice revenue
    invoiceData.forEach(item => {
      const date = new Date(item.issued_date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.revenue += item.amount;
      }
    });
    
    // Add expense data
    expenseData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.expenses += item.amount;
      }
    });
    
    // Calculate profit for each month
    monthlyData.forEach(data => {
      data.profit = data.revenue - data.expenses;
    });
    
    // Convert map to array
    return Array.from(monthlyData.values());
  };

  return {
    isLoading,
    summary,
    error,
    filters,
    updateFilters,
    refreshData: () => fetchFinancialData(filters)
  };
};
