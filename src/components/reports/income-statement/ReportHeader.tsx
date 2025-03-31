
import React from "react";
import { Calendar } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  period: string;
  formattedDate: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, period, formattedDate }) => {
  return (
    <div className="text-center mb-6 print:mb-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground text-lg font-medium">{period}</p>
      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1">
        <Calendar className="h-4 w-4" />
        <p>Generated on {formattedDate}</p>
      </div>
    </div>
  );
};
