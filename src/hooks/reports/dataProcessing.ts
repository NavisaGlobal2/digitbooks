
import { ExpenseBreakdown, RevenueBreakdown } from "./types";

// Process revenue data into a breakdown by source
export const processRevenueBreakdown = (
  revenueData: any[],
  invoiceData: any[],
  totalRevenue: number
): RevenueBreakdown[] => {
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

  return Array.from(revenueBySource.entries()).map(([source, amount]) => ({
    source,
    amount,
    percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
  }));
};

// Process expense data into a breakdown by category
export const processExpenseBreakdown = (
  expenseData: any[],
  totalExpenses: number
): ExpenseBreakdown[] => {
  const expenseByCategory = new Map<string, number>();
  
  expenseData.forEach(item => {
    const category = item.category || 'other';
    expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + item.amount);
  });

  return Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  }));
};

// Calculate financial metrics
export const calculateFinancialMetrics = (totalRevenue: number, totalExpenses: number) => {
  // For this implementation, assume COGS is 30% of revenue (replace with actual COGS calculation)
  const estimatedCOGS = totalRevenue * 0.3;
  const grossProfit = totalRevenue - estimatedCOGS;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    grossProfit,
    netProfit,
    profitMargin
  };
};
