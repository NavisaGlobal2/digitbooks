
import React from "react";
import { Clock } from "lucide-react";

interface ReportTimelineProps {
  startDateFormatted: string;
  endDateFormatted: string;
  reportDuration: number;
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({
  startDateFormatted,
  endDateFormatted,
  reportDuration,
}) => {
  return (
    <div className="mt-4 pt-3 border-t">
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-green-500" />
        <span className="text-base font-medium">Reporting Period: {reportDuration} days</span>
      </div>
      
      <div className="text-center mt-1 mb-3">
        <p className="text-base font-semibold text-gray-700">{startDateFormatted} — {endDateFormatted}</p>
      </div>
      
      <div className="mt-2 w-full max-w-md mx-auto px-4">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-green-500 rounded-full" 
            style={{ width: `100%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span>{startDateFormatted}</span>
          <span>{endDateFormatted}</span>
        </div>
      </div>
    </div>
  );
};
