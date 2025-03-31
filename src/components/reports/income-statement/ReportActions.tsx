
import React, { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileCog, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";

interface ReportActionsProps {
  onBack: () => void;
  title: string;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  reportRef: RefObject<HTMLDivElement>;
  reportData?: any;
  onDirectGeneration?: () => void; // New prop for direct generation
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  onBack,
  title,
  period,
  dateRange,
  reportRef,
  reportData,
  onDirectGeneration
}) => {
  const handleDownload = () => {
    // Use direct generation if available
    if (onDirectGeneration) {
      onDirectGeneration();
      return;
    }

    // Fall back to manual PDF generation
    if (!dateRange) {
      toast.error("Please select a date range to generate a report");
      return;
    }
    
    generateReportPdf({
      title,
      period,
      dateRange,
      reportData
    });
    
    toast.success(`${title} report downloaded successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between gap-3 print:hidden">
      <Button
        variant="outline"
        onClick={onBack}
        className="flex items-center gap-1 w-full xs:w-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Button>
      
      <div className="flex items-center gap-2 w-full xs:w-auto">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-1 flex-1"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
        
        <Button
          onClick={handleDownload}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 flex-1"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>
    </div>
  );
};
