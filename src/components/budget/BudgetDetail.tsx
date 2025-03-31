
import { useBudget } from "@/contexts/BudgetContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { AddCategoryDialog } from "./AddCategoryDialog";
import BudgetHeader from "./detail/BudgetHeader";
import BudgetOverview from "./detail/BudgetOverview";
import CategoriesList from "./detail/CategoriesList";
import { getProgressColorClass, calculateBudgetMetrics } from "./detail/helpers";
import { Skeleton } from "@/components/ui/skeleton";

interface BudgetDetailProps {
  budgetId: string;
  onBack: () => void;
}

const BudgetDetail = ({ budgetId, onBack }: BudgetDetailProps) => {
  const { budgets, updateBudget, deleteBudget, loading } = useBudget();
  const budget = budgets.find((b) => b.id === budgetId);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-8">
        <p>Budget not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Back to Budgets
        </Button>
      </div>
    );
  }

  const { totalSpent, totalAllocated, percentUsed, unallocatedAmount } = calculateBudgetMetrics(budget);
  
  const handleDeleteBudget = async () => {
    if (confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(budgetId);
      onBack();
    }
  };
  
  const handleUpdateCategorySpent = async (categoryId: string, spent: number) => {
    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, spent } : cat
    );
    
    await updateBudget(budgetId, { categories: updatedCategories });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <BudgetHeader 
        budget={budget} 
        onBack={onBack} 
        onDelete={handleDeleteBudget} 
      />
      
      <BudgetOverview 
        budget={budget}
        totalSpent={totalSpent}
        totalAllocated={totalAllocated}
        unallocatedAmount={unallocatedAmount}
        percentUsed={percentUsed}
        getProgressColorClass={getProgressColorClass}
      />
      
      <CategoriesList 
        budget={budget}
        getProgressColorClass={getProgressColorClass}
        onUpdateCategorySpent={handleUpdateCategorySpent}
        onAddCategory={() => setShowAddCategoryDialog(true)}
      />
      
      <AddCategoryDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        budget={budget}
        unallocatedAmount={unallocatedAmount}
      />
    </div>
  );
};

export default BudgetDetail;
