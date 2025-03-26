
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Budget, BudgetCategory } from "@/contexts/BudgetContext";
import CategoryItem from "./CategoryItem";

interface CategoriesListProps {
  budget: Budget;
  getProgressColorClass: (percentage: number) => string;
  onUpdateCategorySpent: (categoryId: string, spent: number) => void;
  onAddCategory: () => void;
}

const CategoriesList = ({ budget, getProgressColorClass, onUpdateCategorySpent, onAddCategory }: CategoriesListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Categories</h2>
        <Button 
          onClick={onAddCategory} 
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 text-xs sm:text-sm"
        >
          <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Add Category</span>
          <span className="xs:hidden">Add</span>
        </Button>
      </div>
      
      {budget.categories.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">No categories defined yet</p>
            <Button 
              variant="outline" 
              onClick={onAddCategory}
              className="border-green-500 text-green-500 hover:bg-green-50 text-xs sm:text-sm"
            >
              Add your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {budget.categories.map((category: BudgetCategory) => (
            <CategoryItem 
              key={category.id}
              category={category} 
              getProgressColorClass={getProgressColorClass}
              onUpdateSpent={onUpdateCategorySpent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
