
import { useState, useEffect } from "react";
import { format } from "date-fns";

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
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");
  
  const startDateFormatted = dateRange ? format(dateRange.startDate, "MMM dd, yyyy") : "";
  const endDateFormatted = dateRange ? format(dateRange.endDate, "MMM dd, yyyy") : "";
  const reportDuration = dateRange ? 
    Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const reportProgress = 100;

  useEffect(() => {
    const timer = setTimeout(() => {
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
      
      const totalExpenses = getTotalExpenses();
      const expensesByCategory = getExpensesByCategory();
      
      const grossProfit = totalRevenue - totalExpenses;
      const netProfit = grossProfit;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
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
  }, [revenues, getTotalRevenue, getRevenueBySource, getTotalExpenses, getExpensesByCategory, dateRange, getRevenueByPeriod]);

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
