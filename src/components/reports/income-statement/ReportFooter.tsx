
import React from "react";

interface ReportFooterProps {
  formattedDate: string;
  startDateFormatted: string;
  endDateFormatted: string;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({
  formattedDate,
  startDateFormatted,
  endDateFormatted,
}) => {
  return (
    <div className="text-sm text-muted-foreground">
      <p>This report is generated based on the revenue and expense data recorded in the system.</p>
      <p>Generated on {formattedDate} | Reporting period: {startDateFormatted} - {endDateFormatted}</p>
    </div>
  );
};
