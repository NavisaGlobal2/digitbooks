
import { useBudget } from "@/contexts/BudgetContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronRight, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BudgetListProps {
  onSelectBudget: (id: string) => void;
  onCreateBudget: () => void;
}

const BudgetList = ({ onSelectBudget, onCreateBudget }: BudgetListProps) => {
  const { budgets } = useBudget();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Budgets</h2>
        <Button 
          onClick={onCreateBudget}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create budget
        </Button>
      </div>
      
      {budgets.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-4">No budgets created yet</p>
            <Button 
              variant="outline" 
              onClick={onCreateBudget}
              className="border-green-500 text-green-500 hover:bg-green-50"
            >
              Create your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            // Calculate total spent
            const totalSpent = budget.categories.reduce(
              (sum, category) => sum + category.spent,
              0
            );
            
            // Calculate percentage used
            const percentUsed = Math.min(
              Math.round((totalSpent / budget.totalBudget) * 100),
              100
            );
            
            // Determine status badge color
            const getBadgeVariant = () => {
              const today = new Date();
              if (budget.endDate < today) return "destructive";
              if (percentUsed > 90) return "warning";
              return "default";
            };
            
            return (
              <Card 
                key={budget.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectBudget(budget.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate">
                      {budget.name}
                    </CardTitle>
                    <Badge variant={getBadgeVariant()} className="bg-green-500 text-white">
                      {percentUsed}% used
                    </Badge>
                  </div>
                  <CardDescription>
                    {format(new Date(budget.startDate), "MMM d")} - {format(new Date(budget.endDate), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${totalSpent.toFixed(2)} / ${budget.totalBudget.toFixed(2)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Progress value={percentUsed} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetList;
