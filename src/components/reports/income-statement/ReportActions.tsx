
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft } from "lucide-react";
import { generateReportPdf } from "@/utils/reports/reportPdfGenerator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportActionsProps {
  onBack: () => void;
  title: string;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  reportRef?: React.RefObject<HTMLDivElement>;
}

export const ReportActions: React.FC<ReportActionsProps> = ({ 
  onBack,
  title,
  period,
  dateRange,
  reportRef
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For reports that support snapshots, use the reportRef approach
    if (reportRef && reportRef.current && (title.toLowerCase() === "cash flow" || title.toLowerCase() === "expense summary")) {
      const element = reportRef.current;
      
      html2canvas(element, {
        scale: 2, // Better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
      });
    } else {
      // For other reports, use the regular generateReportPdf function
      generateReportPdf({
        title,
        period,
        dateRange,
      });
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
