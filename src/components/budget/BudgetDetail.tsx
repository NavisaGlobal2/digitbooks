
import { useBudget } from "@/contexts/BudgetContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ArrowLeft, PlusCircle, Edit, Trash } from "lucide-react";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500 hover:bg-red-50"
            onClick={handleDeleteBudget}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">{budget.name}</h1>
        <p className="text-muted-foreground">
          {format(new Date(budget.startDate), "MMMM d, yyyy")} - {format(new Date(budget.endDate), "MMMM d, yyyy")}
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Total budget: ${budget.totalBudget.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Overall Spending</span>
                <span>
                  ${totalSpent.toFixed(2)} / ${budget.totalBudget.toFixed(2)} ({percentUsed}%)
                </span>
              </div>
              <Progress 
                value={percentUsed} 
                className="h-2" 
                indicatorColor={
                  percentUsed > 90 ? "bg-red-500" :
                  percentUsed > 75 ? "bg-yellow-500" :
                  "bg-green-500"
                }
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-700">Allocated</h3>
                <p className="text-xl font-bold">${totalAllocated.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-emerald-700">Unallocated</h3>
                <p className="text-xl font-bold">${unallocatedAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Button 
            onClick={() => setShowAddCategoryDialog(true)} 
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Category
          </Button>
        </div>
        
        {budget.categories.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No categories defined yet</p>
              <Button 
                variant="outline" 
                onClick={() => setShowAddCategoryDialog(true)}
                className="border-green-500 text-green-500 hover:bg-green-50"
              >
                Add your first category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {budget.categories.map((category) => {
              const percentCategoryUsed = Math.min(
                Math.round((category.spent / category.amount) * 100),
                100
              );
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${category.spent.toFixed(2)} / ${category.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const newSpent = parseFloat(
                              prompt("Enter new spent amount:", category.spent.toString()) || "0"
                            );
                            if (!isNaN(newSpent) && newSpent >= 0) {
                              handleUpdateCategorySpent(category.id, newSpent);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={percentCategoryUsed} 
                      className="h-2"
                      indicatorColor={
                        percentCategoryUsed > 90 ? "bg-red-500" :
                        percentCategoryUsed > 75 ? "bg-yellow-500" :
                        "bg-green-500"
                      }
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
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
