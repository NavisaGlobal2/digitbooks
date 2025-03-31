
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { BudgetCategory } from "@/contexts/BudgetContext";

interface CategoryItemProps {
  category: BudgetCategory;
  getProgressColorClass: (percentage: number) => string;
  onUpdateSpent: (categoryId: string, spent: number) => void;
}

const CategoryItem = ({ category, getProgressColorClass, onUpdateSpent }: CategoryItemProps) => {
  const percentCategoryUsed = Math.min(
    Math.round((category.spent / category.amount) * 100),
    100
  );
  
  return (
    <Card key={category.id}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-sm sm:text-base">{category.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ₦{category.spent.toFixed(2)} / ₦{category.amount.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              onClick={() => {
                const newSpent = parseFloat(
                  prompt("Enter new spent amount:", category.spent.toString()) || "0"
                );
                if (!isNaN(newSpent) && newSpent >= 0) {
                  onUpdateSpent(category.id, newSpent);
                }
              }}
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <Progress 
          value={percentCategoryUsed} 
          className={`h-2 ${getProgressColorClass(percentCategoryUsed)}`}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryItem;
