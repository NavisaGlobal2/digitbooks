
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BudgetSummaryCardsProps {
  totalBudgeted: number;
  totalSpent: number;
  formatCurrency: (value: number) => string;
}

const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  totalBudgeted,
  totalSpent,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Budgeted</span>
            <span className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
            <span className={`text-sm ${totalSpent <= totalBudgeted ? 'text-green-600' : 'text-red-600'}`}>
              {totalSpent <= totalBudgeted 
                ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget used` 
                : `${((totalSpent - totalBudgeted) / totalBudgeted * 100).toFixed(1)}% over budget`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSummaryCards;
