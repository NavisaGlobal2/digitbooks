
import React from "react";
import { format } from "date-fns";

interface BudgetAnalysisHeaderProps {
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  selectedBudget: any;
}

const BudgetAnalysisHeader: React.FC<BudgetAnalysisHeaderProps> = ({ 
  period, 
  dateRange, 
  selectedBudget 
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">Budget Analysis</h1>
      <p className="text-muted-foreground">
        {period}
        {dateRange && (
          <span className="block text-sm">
            {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
          </span>
        )}
      </p>
      {selectedBudget && (
        <p className="text-sm font-medium mt-2">
          Budget: {selectedBudget.name} ({format(new Date(selectedBudget.startDate), "MMM d, yyyy")} - {format(new Date(selectedBudget.endDate), "MMM d, yyyy")})
        </p>
      )}
    </div>
  );
};

export default BudgetAnalysisHeader;
