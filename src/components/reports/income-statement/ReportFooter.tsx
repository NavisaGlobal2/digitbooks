
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
    <div className="text-sm text-muted-foreground border-t pt-4 mt-6">
      <p>This report is generated based on the revenue and expense data recorded in the system.</p>
      <p><span className="font-medium">Report period:</span> {startDateFormatted} - {endDateFormatted} | <span className="font-medium">Generated on:</span> {formattedDate}</p>
    </div>
  );
};
