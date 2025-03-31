
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ChartData, ReportData } from "../types/reportTypes";

/**
 * Generates the content for a Cash Flow report
 */
export const generateCashFlowReportContent = (doc: jsPDF, reportData?: ReportData): void => {
  const startY = 60;
  
  // Add summary section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cash Flow Summary", 20, startY);
  
  // Set up data for summary table
  const cashflowData = reportData?.cashflowData || generateSampleCashflowData();
  
  // Calculate total inflow and outflow
  const totalInflow = cashflowData.reduce((sum, item) => sum + item.inflow, 0);
  const totalOutflow = cashflowData.reduce((sum, item) => sum + item.outflow, 0);
  const netCashflow = totalInflow - totalOutflow;
  
  // Create summary table
  doc.autoTable({
    startY: startY + 5,
    head: [["Metric", "Amount"]],
    body: [
      ["Total Cash Inflow", `₦${totalInflow.toLocaleString()}`],
      ["Total Cash Outflow", `₦${totalOutflow.toLocaleString()}`],
      ["Net Cash Flow", `₦${netCashflow.toLocaleString()}`]
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 10, left: 20, right: 20 }
  });
  
  // Add monthly breakdown section
  const currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Cash Flow Breakdown", 20, currentY);
  
  // Create monthly breakdown table
  doc.autoTable({
    startY: currentY + 5,
    head: [["Month", "Cash Inflow", "Cash Outflow", "Net Cash Flow"]],
    body: cashflowData.map(item => [
      item.name,
      `₦${item.inflow.toLocaleString()}`,
      `₦${item.outflow.toLocaleString()}`,
      `₦${(item.inflow - item.outflow).toLocaleString()}`
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 10, left: 20, right: 20 }
  });
  
  // Add chart placeholder text
  const chartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Note: Interactive cash flow chart available in the digital version of this report.", 20, chartY);
};

/**
 * Generate sample cash flow data if no actual data is provided
 */
function generateSampleCashflowData(): ChartData[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  
  return months.slice(currentMonth - 5, currentMonth + 1).map(month => {
    const inflow = Math.floor(Math.random() * 10000) + 2000;
    const outflow = Math.floor(Math.random() * 8000) + 1000;
    
    return {
      name: month,
      inflow,
      outflow,
    };
  });
}
