
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft } from "lucide-react";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import { toast } from "sonner";

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

  const handleDownload = async () => {
    try {
      toast.loading("Preparing report for download...");
      
      // Allow time for rendering before capturing
      setTimeout(async () => {
        await generateReportPdf({
          title,
          period,
          dateRange,
        });
        toast.dismiss();
        toast.success("Report downloaded successfully!");
      }, 500); // Increased delay to ensure rendering is complete
    } catch (error) {
      console.error("Error generating report:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    }
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
