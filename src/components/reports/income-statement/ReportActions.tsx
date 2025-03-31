
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";

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
      const toastId = toast.loading("Preparing report for download...");
      
      // Find the report container - adapts to both income statement and cash flow reports
      const reportContainer = document.querySelector(
        `.income-statement-report-container, .cash-flow-report-container`
      ) as HTMLElement;
      
      if (!reportContainer) {
        toast.error("Could not find report content", { id: toastId });
        return;
      }
      
      // Create a clean copy of the report for capturing
      const clone = reportContainer.cloneNode(true) as HTMLElement;
      
      // Style and position the clone
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = `${reportContainer.offsetWidth}px`;
      clone.style.backgroundColor = 'white';
      
      // Remove buttons, navigation elements, or any UI elements that shouldn't appear in PDF
      clone.querySelectorAll('button, .print\\:hidden').forEach(el => el.remove());
      
      // Append to body temporarily for rendering
      document.body.appendChild(clone);
      
      try {
        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capture the element
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            const images = clonedDoc.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
              images[i].crossOrigin = "anonymous";
            }
          }
        });
        
        // Create PDF with dimensions matching the captured element
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        // Add the captured image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Generate filename with current date
        const dateStr = format(new Date(), "yyyyMMdd");
        const formattedTitle = title.replace(/\s+/g, '-').toLowerCase();
        const fileName = `${formattedTitle}-report-${dateStr}.pdf`;
        
        // Save the PDF
        pdf.save(fileName);
        
        toast.success("Report downloaded successfully!", { id: toastId });
      } finally {
        // Always clean up the temporary element
        document.body.removeChild(clone);
      }
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
