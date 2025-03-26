
import { useBudget } from "@/contexts/BudgetContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { AddCategoryDialog } from "./AddCategoryDialog";
import BudgetHeader from "./detail/BudgetHeader";
import BudgetOverview from "./detail/BudgetOverview";
import CategoriesList from "./detail/CategoriesList";
import { getProgressColorClass, calculateBudgetMetrics } from "./detail/helpers";

interface BudgetDetailProps {
  budgetId: string;
  onBack: () => void;
}

const BudgetDetail = ({ budgetId, onBack }: BudgetDetailProps) => {
  const { budgets, updateBudget, deleteBudget } = useBudget();
  const budget = budgets.find((b) => b.id === budgetId);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

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
  
  const handleDeleteBudget = () => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(budgetId);
      onBack();
      toast.success("Budget deleted successfully");
    }
  };
  
  const handleUpdateCategorySpent = (categoryId: string, spent: number) => {
    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, spent } : cat
    );
    
    updateBudget(budgetId, { categories: updatedCategories });
    toast.success("Category updated successfully");
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
