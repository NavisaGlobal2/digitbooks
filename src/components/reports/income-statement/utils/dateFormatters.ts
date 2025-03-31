
import { format } from "date-fns";

/**
 * Formats dates for report display
 */
export const formatReportDates = (dateRange: { startDate: Date; endDate: Date } | null) => {
  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");
  
  let startDateFormatted = "";
  let endDateFormatted = "";
  let reportDuration = 0;
  
  if (dateRange) {
    startDateFormatted = format(dateRange.startDate, "MMM dd, yyyy");
    endDateFormatted = format(dateRange.endDate, "MMM dd, yyyy");
    reportDuration = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  return {
    formattedDate,
    startDateFormatted,
    endDateFormatted,
    reportDuration
  };
};
