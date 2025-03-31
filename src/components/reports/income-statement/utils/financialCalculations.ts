
/**
 * Calculates key financial metrics from revenue and expense data
 */
export const calculateFinancialMetrics = (
  totalRevenue: number, 
  totalExpenses: number
) => {
  const grossProfit = totalRevenue - totalExpenses;
  const netProfit = grossProfit; // For now, these are the same but could differ with additional calculations
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    grossProfit,
    netProfit,
    profitMargin
  };
};
