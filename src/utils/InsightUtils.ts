
/**
 * Utility functions for processing and formatting AI insights
 */

/**
 * Formats currency values to Naira format
 */
export const formatToNaira = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Calculates percentage change between two values
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): string => {
  if (oldValue === 0) return "∞%"; // Handle division by zero
  
  const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

/**
 * Extracts key metrics from financial data
 */
export const extractKeyMetrics = (financialData: any) => {
  if (!financialData) return null;
  
  const totalRevenue = financialData?.revenues?.total || 0;
  const totalExpenses = financialData?.expenses?.total || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  const overdueInvoices = financialData?.invoices?.overdue || 0;
  const unpaidInvoices = financialData?.invoices?.unpaid || 0;
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    overdueInvoices,
    unpaidInvoices,
    cashflow: {
      status: netProfit >= 0 ? "positive" : "negative",
      value: Math.abs(netProfit)
    }
  };
};

/**
 * Formats financial data for AI processing
 */
export const prepareDataForAI = (financialData: any) => {
  if (!financialData) return null;
  
  const metrics = extractKeyMetrics(financialData);
  
  // Add context and explanations
  return {
    ...metrics,
    context: {
      timeFrame: "current month",
      currency: "NGN",
      lastUpdated: new Date().toISOString()
    },
    expenseBreakdown: financialData?.expenses?.byCategory || {},
    revenueBreakdown: financialData?.revenues?.bySources || {}
  };
};
