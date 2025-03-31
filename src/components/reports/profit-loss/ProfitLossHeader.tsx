
import React from "react";
import { format } from "date-fns";

interface ProfitLossHeaderProps {
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const ProfitLossHeader: React.FC<ProfitLossHeaderProps> = ({ period, dateRange }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
      <p className="text-muted-foreground">
        {period}
        {dateRange && (
          <span className="block text-sm">
            {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
          </span>
        )}
      </p>
    </div>
  );
};

export default ProfitLossHeader;
