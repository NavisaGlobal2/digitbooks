
import React, { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, History, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveReportToDatabase } from "@/services/reportService";
import ReportDateFilter from "../filters/ReportDateFilter";

interface ReportActionsProps {
  onBack: () => void;
  title: string;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  reportRef: RefObject<HTMLDivElement>;
  reportData?: any;
  onDirectGeneration?: () => void;
  onDateRangeChange?: (range: { startDate: Date; endDate: Date } | null) => void;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  onBack,
  title,
  period,
  dateRange,
  reportRef,
  reportData,
  onDirectGeneration,
  onDateRangeChange
}) => {
  const handleDownload = async () => {
    try {
      // If there's a direct generation function provided, use that instead
      if (onDirectGeneration) {
        onDirectGeneration();
        return;
      }
      
      // Check for valid date range and reference to report content
      if (!dateRange) {
        toast.error("Please select a date range to generate a report");
        return;
      }

      if (!reportRef.current) {
        toast.error("Could not find report content");
        console.error("Report reference is null or undefined");
        return;
      }

      toast.info(`Generating ${title} PDF...`);
      
      // Capture the report content as an image
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Create new PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Save the PDF
      const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      
      // Save report metadata to database for history
      if (reportData) {
        await saveReportToDatabase(
          title.toLowerCase().replace(/\s+/g, "-"),
          title,
          period,
          dateRange,
          reportData,
          "pdf"
        );
      }
      
      toast.success(`${title} report downloaded successfully!`);
    } catch (error) {
      console.error(`${title} PDF generation error:`, error);
      toast.error(`Failed to generate ${title} PDF. Please try again.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Report Details</h2>
        </div>
        <p className="text-muted-foreground">View and export your financial report</p>
        
        <div className="flex flex-wrap justify-between items-center gap-4 py-2">
          {onDateRangeChange && (
            <ReportDateFilter 
              dateRange={dateRange}
              onChange={onDateRangeChange}
              onGenerateReport={handleDownload}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
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
    </div>
  );
};
