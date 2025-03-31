
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/contexts/BudgetContext";

interface BudgetOverviewProps {
  budget: Budget;
  totalSpent: number;
  totalAllocated: number;
  unallocatedAmount: number;
  percentUsed: number;
  getProgressColorClass: (percentage: number) => string;
}

const BudgetOverview = ({ 
  budget, 
  totalSpent, 
  totalAllocated, 
  unallocatedAmount, 
  percentUsed,
  getProgressColorClass
}: BudgetOverviewProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl">Budget Overview</CardTitle>
        <CardDescription>
          Total budget: ₦{budget.totalBudget.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-xs sm:text-sm">
              <span>Overall Spending</span>
              <span>
                ₦{totalSpent.toFixed(2)} / ₦{budget.totalBudget.toFixed(2)} ({percentUsed}%)
              </span>
            </div>
            <Progress 
              value={percentUsed} 
              className={`h-2 ${getProgressColorClass(percentUsed)}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium text-blue-700">Allocated</h3>
              <p className="text-lg sm:text-xl font-bold">₦{totalAllocated.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium text-emerald-700">Unallocated</h3>
              <p className="text-lg sm:text-xl font-bold">₦{unallocatedAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
