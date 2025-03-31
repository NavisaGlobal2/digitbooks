
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ChartData, ReportData } from "../types/reportTypes";

/**
 * Generates the content for a Cash Flow report
 */
export const generateCashFlowReportContent = (doc: jsPDF, reportData?: ReportData): void => {
  if (!reportData || !reportData.cashflowData) {
    return generateSampleCashFlowReport(doc);
  }

  const startY = 60;
  const cashflowData = reportData.cashflowData;
  
  // Calculate total inflow, outflow and net cash flow
  const totalInflow = cashflowData.reduce((sum, item) => sum + item.inflow, 0);
  const totalOutflow = cashflowData.reduce((sum, item) => sum + item.outflow, 0);
  const netCashflow = totalInflow - totalOutflow;
  
  // Add summary section title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Cash Flow Summary", 105, startY, { align: "center" });
  
  // Add summary cards in a grid layout - similar to UI display
  const cardWidth = 55;
  const cardHeight = 30;
  const padding = 5;
  const marginTop = 10;
  const startCardY = startY + marginTop;
  
  // Inflow Card
  doc.setFillColor(240, 253, 244); // light green background
  doc.setDrawColor(167, 243, 208); // green border
  doc.roundedRect(20, startCardY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setTextColor(6, 95, 70); // dark green text
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Inflow", 20 + padding, startCardY + padding + 5);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${totalInflow.toLocaleString()}`, 20 + padding, startCardY + padding + 15);
  
  // Outflow Card
  doc.setFillColor(243, 242, 255); // light purple background
  doc.setDrawColor(216, 180, 254); // purple border
  doc.roundedRect(82.5, startCardY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setTextColor(76, 29, 149); // dark purple text
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Outflow", 82.5 + padding, startCardY + padding + 5);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${totalOutflow.toLocaleString()}`, 82.5 + padding, startCardY + padding + 15);
  
  // Net Cash Flow Card
  doc.setFillColor(239, 246, 255); // light blue background
  doc.setDrawColor(147, 197, 253); // blue border
  doc.roundedRect(145, startCardY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setTextColor(30, 64, 175); // dark blue text
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Net Cash Flow", 145 + padding, startCardY + padding + 5);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${netCashflow.toLocaleString()}`, 145 + padding, startCardY + padding + 15);
  
  // Add chart placeholder - similar to the chart in the UI
  const chartY = startCardY + cardHeight + 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Cash Flow Chart", 20, chartY);
  
  // Draw chart placeholder
  const chartHeight = 80;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, chartY + 5, 170, chartHeight, 3, 3, 'FD');
  
  // Simulate chart area with bars
  const barStartX = 30;
  const barSpacing = 25;
  const barWidth = 15;
  const maxBarHeight = 60;
  const baselineY = chartY + 5 + chartHeight - 15;
  
  cashflowData.forEach((item, index) => {
    const x = barStartX + (barSpacing * index);
    
    // Calculate bar heights proportionally
    const maxValue = Math.max(...cashflowData.map(d => Math.max(d.inflow, d.outflow)));
    const inflowHeight = (item.inflow / maxValue) * maxBarHeight;
    const outflowHeight = (item.outflow / maxValue) * maxBarHeight;
    
    // Draw inflow bar (green)
    doc.setFillColor(16, 185, 129); // green for inflow
    doc.rect(x, baselineY - inflowHeight, barWidth / 2, inflowHeight, 'F');
    
    // Draw outflow bar (purple)
    doc.setFillColor(155, 135, 245); // purple for outflow
    doc.rect(x + barWidth / 2, baselineY - outflowHeight, barWidth / 2, outflowHeight, 'F');
    
    // Add month label
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(item.name, x + barWidth / 2, baselineY + 10, { align: "center" });
  });
  
  // Add legend
  doc.setFillColor(16, 185, 129);
  doc.rect(70, chartY + 5 + chartHeight + 5, 8, 8, 'F');
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(10);
  doc.text("Inflow", 82, chartY + 5 + chartHeight + 10);
  
  doc.setFillColor(155, 135, 245);
  doc.rect(120, chartY + 5 + chartHeight + 5, 8, 8, 'F');
  doc.text("Outflow", 132, chartY + 5 + chartHeight + 10);
  
  // Add monthly breakdown section
  const tableStartY = chartY + chartHeight + 25;
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Monthly Cash Flow Breakdown", 105, tableStartY, { align: "center" });
  
  // Create monthly breakdown table
  doc.autoTable({
    startY: tableStartY + 5,
    head: [["Month", "Cash Inflow", "Cash Outflow", "Net Cash Flow"]],
    body: cashflowData.map(item => [
      item.name,
      `₦${item.inflow.toLocaleString()}`,
      `₦${item.outflow.toLocaleString()}`,
      `₦${(item.inflow - item.outflow).toLocaleString()}`
    ]),
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: 255,
      fontStyle: "bold" 
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right", fontStyle: "bold" }
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 10, left: 20, right: 20 }
  });
};

/**
 * Generate sample cash flow report if no actual data is provided
 */
function generateSampleCashFlowReport(doc: jsPDF): void {
  const cashflowData = generateSampleCashflowData();
  
  // Create a mock reportData object
  const mockReportData: ReportData = {
    title: "Cash Flow",
    period: "Sample Period",
    cashflowData
  };
  
  // Use the main function with the mock data
  generateCashFlowReportContent(doc, mockReportData);
}

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
