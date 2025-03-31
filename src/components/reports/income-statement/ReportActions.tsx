
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft } from "lucide-react";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";

interface ReportActionsProps {
  onBack: () => void;
  title: string;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

export const ReportActions: React.FC<ReportActionsProps> = ({ 
  onBack,
  title,
  period,
  dateRange
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    generateReportPdf({
      title,
      period,
      dateRange,
    });
  };

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between gap-3 print:hidden">
      <Button variant="outline" onClick={onBack} className="w-full xs:w-auto">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>
      <div className="flex gap-2 w-full xs:w-auto">
        <Button variant="outline" onClick={handlePrint} className="flex-1 xs:flex-none">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownload} className="bg-green-500 hover:bg-green-600 text-white flex-1 xs:flex-none">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};
