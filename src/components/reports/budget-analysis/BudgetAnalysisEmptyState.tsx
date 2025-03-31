
import React from "react";

const BudgetAnalysisEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No budget data available for the selected period.</p>
    </div>
  );
};

export default BudgetAnalysisEmptyState;
