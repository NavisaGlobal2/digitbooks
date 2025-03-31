
import React, { useState } from "react";
import { ArrowLeft, BarChart3, Download, FileText, Calendar, Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import { saveReportToDatabase } from "@/services/reportService";
import ReportDateFilter from "./filters/ReportDateFilter";

interface GenericReportViewProps {
  reportType: string;
  onBack: () => void;
  dateRange?: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const GenericReportView = ({ 
  reportType, 
  onBack, 
  dateRange,
  onDirectGeneration 
}: GenericReportViewProps) => {
  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");
  
  // For demonstration, set a report period from props or default
  const [localDateRange, setLocalDateRange] = useState<{ startDate: Date; endDate: Date } | null>(
    dateRange || {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date()
    }
  );
  
  const reportPeriod = {
    start: localDateRange ? format(localDateRange.startDate, "MMM dd, yyyy") : "",
    end: localDateRange ? format(localDateRange.endDate, "MMM dd, yyyy") : ""
  };

  const handleDateRangeChange = (newRange: { startDate: Date; endDate: Date } | null) => {
    setLocalDateRange(newRange);
  };

  const handleDownload = async () => {
    try {
      if (onDirectGeneration) {
        onDirectGeneration();
        return;
      }
      
      if (!localDateRange) {
        toast.error("Please select a date range first");
        return;
      }
      
      const title = reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ");
      
      toast.info(`Generating ${title} report...`);
      
      await generateReportPdf({
        title,
        period: `${reportPeriod.start} — ${reportPeriod.end}`,
        dateRange: localDateRange
      });
      
      // Save report metadata to database for history
      await saveReportToDatabase(
        reportType,
        title,
        `${reportPeriod.start} — ${reportPeriod.end}`,
        localDateRange,
        { generatedAt: new Date().toISOString() },
        "pdf"
      );
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(`Failed to generate report: ${(error as Error).message || "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Report Details</h2>
        </div>
        <p className="text-muted-foreground">View and export your financial report</p>
        
        <div className="flex flex-wrap justify-between items-center gap-4 py-2">
          <ReportDateFilter 
            dateRange={localDateRange}
            onChange={handleDateRangeChange}
            onGenerateReport={handleDownload}
          />
        </div>

        <div className="flex justify-between items-center pt-2 pb-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div id="report-container" className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <BarChart3 className="h-16 sm:h-24 w-16 sm:w-24 mx-auto text-green-500 mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ")}{" "}
            Report
          </h2>
          <p className="text-lg font-medium text-muted-foreground">
            {reportPeriod.start && reportPeriod.end ? `${reportPeriod.start} — ${reportPeriod.end}` : "Select a date range"}
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base mt-1">
            <Calendar className="h-4 w-4" />
            <p>{formattedDate}</p>
          </div>
          
          {/* Report Timeline */}
          {localDateRange && (
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-base font-medium">
                  Reporting Period: {Math.ceil(
                    (localDateRange.endDate.getTime() - localDateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
                  )} days
                </span>
              </div>
              
              <div className="text-center mt-1 mb-3">
                <p className="text-base font-semibold text-gray-700">{reportPeriod.start} — {reportPeriod.end}</p>
              </div>
              
              <div className="mt-3 w-full max-w-md mx-auto px-4">
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>{reportPeriod.start}</span>
                  <span>{reportPeriod.end}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="my-6 border-y py-4 bg-gray-50 rounded">
          <h3 className="text-center text-lg font-medium">
            Financial Summary for Period: {reportPeriod.start && reportPeriod.end ? 
              `${reportPeriod.start} - ${reportPeriod.end}` : 
              "Select a date range"
            }
          </h3>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 sm:h-16 w-12 sm:w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground text-sm">
              Preview of the report would be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericReportView;
