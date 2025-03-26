
// Helper functions for the budget detail components
export const getProgressColorClass = (percentage: number) => {
  if (percentage > 90) return "bg-red-500";
  if (percentage > 75) return "bg-yellow-500";
  return "bg-green-500";
};

export const calculateBudgetMetrics = (budget: {
  totalBudget: number;
  categories: Array<{ spent: number; amount: number }>;
}) => {
  const totalSpent = budget.categories.reduce(
    (sum, category) => sum + category.spent,
    0
  );
  
  const totalAllocated = budget.categories.reduce(
    (sum, category) => sum + category.amount,
    0
  );
  
  const percentUsed = Math.min(Math.round((totalSpent / budget.totalBudget) * 100), 100);
  const unallocatedAmount = budget.totalBudget - totalAllocated;

  return {
    totalSpent,
    totalAllocated,
    percentUsed,
    unallocatedAmount
  };
};
