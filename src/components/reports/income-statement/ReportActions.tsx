
import React, { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileCog, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const handleDownload = async () => {
    // Use direct generation if available
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
      return;
    }

    try {
      toast.info("Generating PDF...");
      
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
      
      toast.success(`${title} report downloaded successfully!`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
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
