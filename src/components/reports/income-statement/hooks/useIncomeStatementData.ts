
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { calculateFinancialMetrics } from "../utils/financialCalculations";
import { formatReportDates } from "../utils/dateFormatters";
import { useReportDataLoading } from "./useReportDataLoading";

export interface ReportData {
  totalRevenue: number;
  revenueBySource: Record<string, number>;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export const useIncomeStatementData = (
  revenues: any[],
  getTotalRevenue: () => number,
  getRevenueBySource: () => Record<string, number>,
  getRevenueByPeriod: (startDate: Date, endDate: Date) => any[],
  getTotalExpenses: () => number,
  getExpensesByCategory: () => Record<string, number>,
  dateRange: { startDate: Date; endDate: Date } | null
) => {
  const { isLoading, setIsLoading } = useReportDataLoading();
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Format the date information using the utility function
  const {
    formattedDate,
    startDateFormatted,
    endDateFormatted,
    reportDuration
  } = formatReportDates(dateRange);

  const reportProgress = 100; // This could be made dynamic if needed

  useEffect(() => {
    const timer = setTimeout(() => {
      // Extract revenue data based on date range if available
      const { 
        filteredRevenues, 
        totalRevenue, 
        revenueBySource 
      } = getRevenueData(revenues, dateRange, getTotalRevenue, getRevenueBySource, getRevenueByPeriod);
      
      // Get expense data
      const totalExpenses = getTotalExpenses();
      const expensesByCategory = getExpensesByCategory();
      
      // Calculate financial metrics
      const { grossProfit, netProfit, profitMargin } = calculateFinancialMetrics(
        totalRevenue, 
        totalExpenses
      );
      
      // Set the report data state
      setReportData({
        totalRevenue,
        revenueBySource,
        totalExpenses,
        expensesByCategory,
        grossProfit,
        netProfit,
        profitMargin
      });
      
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [revenues, getTotalRevenue, getRevenueBySource, getTotalExpenses, getExpensesByCategory, dateRange, getRevenueByPeriod, setIsLoading]);

  return {
    isLoading,
    reportData,
    formattedDate,
    startDateFormatted,
    endDateFormatted,
    reportDuration,
    reportProgress
  };
};

// Helper function to get revenue data based on date range
const getRevenueData = (
  revenues: any[],
  dateRange: { startDate: Date; endDate: Date } | null,
  getTotalRevenue: () => number,
  getRevenueBySource: () => Record<string, number>,
  getRevenueByPeriod: (startDate: Date, endDate: Date) => any[]
) => {
  let filteredRevenues = revenues;
  let totalRevenue = 0;
  let revenueBySource = {};
  
  if (dateRange) {
    filteredRevenues = getRevenueByPeriod(dateRange.startDate, dateRange.endDate);
    totalRevenue = filteredRevenues.reduce((total, revenue) => total + revenue.amount, 0);
    
    revenueBySource = filteredRevenues.reduce((acc, revenue) => {
      const source = revenue.source;
      if (!acc[source]) {
        acc[source] = 0;
      }
      acc[source] += revenue.amount;
      return acc;
    }, {} as Record<string, number>);
  } else {
    totalRevenue = getTotalRevenue();
    revenueBySource = getRevenueBySource();
  }
  
  return { filteredRevenues, totalRevenue, revenueBySource };
};
