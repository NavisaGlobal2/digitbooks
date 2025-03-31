
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UseReportGenerationReturn {
  selectedReportType: string | null;
  reportPeriod: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  selectedDatabase: string;
  handleGenerateReport: (
    reportType: string,
    reportPeriod: string,
    fileFormat: string,
    customDateRange?: { startDate: Date; endDate: Date }
  ) => void;
  setSelectedReportType: (type: string | null) => void;
  setSelectedDatabase: (database: string) => void;
}

export const useReportGeneration = (): UseReportGenerationReturn => {
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState("Current Month");
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState("primary");

  const handleGenerateReport = (
    reportType: string,
    reportPeriod: string,
    fileFormat: string,
    customDateRange?: { startDate: Date; endDate: Date }
  ) => {
    let displayPeriod = reportPeriod.replace("-", " ");
    
    if (customDateRange) {
      displayPeriod = `${format(customDateRange.startDate, "MMM dd, yyyy")} - ${format(customDateRange.endDate, "MMM dd, yyyy")}`;
      setDateRange(customDateRange);
    } else {
      setDateRange(null);
    }
    
    toast.success(
      `Generating ${reportType.replace("-", " ")} report for ${displayPeriod} in ${fileFormat.toUpperCase()} format using ${selectedDatabase} database`
    );
    
    setReportPeriod(displayPeriod);
    
    if (reportType === "income-statement") {
      setSelectedReportType("income-statement");
    } else {
      setSelectedReportType(reportType);
      setTimeout(() => {
        toast.success("Report generated successfully!");
      }, 2000);
    }
  };

  return {
    selectedReportType,
    reportPeriod,
    dateRange,
    selectedDatabase,
    handleGenerateReport,
    setSelectedReportType,
    setSelectedDatabase
  };
};
