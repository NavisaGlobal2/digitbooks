
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FinancialSummary, ReportFilters } from "./types";
import { getDateRange, generateMonthlySummary } from "./dateUtils";
import { fetchExpenses, fetchInvoiceRevenue, fetchRevenue } from "./dataFetching";
import { calculateFinancialMetrics, processExpenseBreakdown, processRevenueBreakdown } from "./dataProcessing";

export type { DateRange, ReportFilters, RevenueBreakdown, ExpenseBreakdown, FinancialSummary } from "./types";

export const useFinancialReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "current-month",
  });
  const [error, setError] = useState<string | null>(null);

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
      
      // Calculate metrics
      const { grossProfit, netProfit, profitMargin } = calculateFinancialMetrics(totalRevenue, totalExpenses);
      
      // Process breakdowns
      const revenueBreakdown = processRevenueBreakdown(revenueData, invoiceData, totalRevenue);
      const expenseBreakdown = processExpenseBreakdown(expenseData, totalExpenses);
      
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

  return {
    isLoading,
    summary,
    error,
    filters,
    updateFilters,
    refreshData: () => fetchFinancialData(filters)
  };
};

export default useFinancialReports;
