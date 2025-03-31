
import React, { useState, useEffect, useRef } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ReportCard } from "./ReportCard";
import { ReportHeader } from "./ReportHeader";
import { ReportTimeline } from "./ReportTimeline";
import { ReportSummary } from "./ReportSummary";
import { ReportFooter } from "./ReportFooter";
import { ReportActions } from "./ReportActions";
import { formatCurrency } from "@/utils/invoice/formatters";
import { useIncomeStatementData } from "./hooks/useIncomeStatementData";
import ReportDateFilter from "../filters/ReportDateFilter";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface IncomeStatementReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const IncomeStatementReport = ({ onBack, period, dateRange, onDirectGeneration }: IncomeStatementReportProps) => {
  const { revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod } = useRevenue();
  const { getTotalExpenses, getExpensesByCategory } = useExpenses();
  const reportRef = useRef<HTMLDivElement>(null);
  const [localDateRange, setLocalDateRange] = useState<{ startDate: Date; endDate: Date } | null>(dateRange);
  
  const { isLoading, reportData, formattedDate, startDateFormatted, endDateFormatted, reportDuration } = 
    useIncomeStatementData(revenues, getTotalRevenue, getRevenueBySource, getRevenueByPeriod, getTotalExpenses, getExpensesByCategory, localDateRange || dateRange);
  
  useEffect(() => {
    if (dateRange && !localDateRange) {
      setLocalDateRange(dateRange);
    }
  }, [dateRange]);

  const handleDateRangeChange = (newRange: { startDate: Date; endDate: Date } | null) => {
    setLocalDateRange(newRange);
  };

  const handleDownload = async () => {
    if (onDirectGeneration) {
      onDirectGeneration();
      return;
    }
    
    try {
      if (!reportRef.current) {
        toast.error("Could not find report content");
        return;
      }

      toast.info(`Generating Income Statement PDF...`);
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const fileName = `income-statement_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      
      toast.success(`Income Statement report downloaded successfully!`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDF. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
          <Button variant="outline" onClick={onBack} className="w-full xs:w-auto">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <ReportCard isLoading={true} />
      </div>
    );
  }

  if (!reportData) {
    return <div>Error loading report data</div>;
  }

  return (
    <div className="space-y-4 print:p-6">
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
            <ChevronLeft className="h-4 w-4" />
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
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <ReportCard ref={reportRef} id="report-container">
        <ReportHeader 
          title="Income Statement" 
          period={period}
          formattedDate={formattedDate}
        />
        
        {localDateRange && (
          <ReportTimeline 
            startDateFormatted={startDateFormatted}
            endDateFormatted={endDateFormatted}
            reportDuration={reportDuration}
          />
        )}

        <div className="my-6 border-y py-4 bg-gray-50 rounded">
          <h3 className="text-center text-lg font-medium">Financial Summary for Period: {startDateFormatted} - {endDateFormatted}</h3>
        </div>

        <ReportSummary reportData={reportData} />
        
        <ReportFooter 
          formattedDate={formattedDate} 
          startDateFormatted={startDateFormatted} 
          endDateFormatted={endDateFormatted} 
        />
      </ReportCard>
    </div>
  );
};

export default IncomeStatementReport;
