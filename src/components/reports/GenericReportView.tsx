
import React from "react";
import { ArrowLeft, BarChart3, Download, FileText, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import { saveReportToDatabase } from "@/services/reportService";

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
  const startDate = dateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = dateRange?.endDate || new Date();
  const reportPeriod = {
    start: format(startDate, "MMM dd, yyyy"),
    end: format(endDate, "MMM dd, yyyy")
  };

  const handleDownload = async () => {
    try {
      if (onDirectGeneration) {
        onDirectGeneration();
        return;
      }
      
      if (!dateRange) {
        toast.error("Please select a date range first");
        return;
      }
      
      const title = reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ");
      
      toast.info(`Generating ${title} report...`);
      
      await generateReportPdf({
        title,
        period: `${reportPeriod.start} — ${reportPeriod.end}`,
        dateRange: {
          startDate,
          endDate
        }
      });
      
      // Save report metadata to database for history
      await saveReportToDatabase(
        reportType,
        title,
        `${reportPeriod.start} — ${reportPeriod.end}`,
        { startDate, endDate },
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
      <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-1 w-full xs:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full xs:w-auto"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div id="report-container" className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <BarChart3 className="h-16 sm:h-24 w-16 sm:w-24 mx-auto text-green-500 mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace("-", " ")}{" "}
            Report
          </h2>
          <p className="text-lg font-medium text-muted-foreground">
            {reportPeriod.start} — {reportPeriod.end}
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base mt-1">
            <Calendar className="h-4 w-4" />
            <p>{formattedDate}</p>
          </div>
          
          {/* Report Timeline */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-base font-medium">Reporting Period: 30 days</span>
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
        </div>

        <div className="my-6 border-y py-4 bg-gray-50 rounded">
          <h3 className="text-center text-lg font-medium">Financial Summary for Period: {reportPeriod.start} - {reportPeriod.end}</h3>
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
