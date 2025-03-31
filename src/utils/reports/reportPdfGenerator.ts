
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ReportData } from "./types/reportTypes";
import { generateIncomeStatementContent } from "./generators/incomeStatementGenerator";
import { generateGenericReportContent } from "./generators/genericReportGenerator";
import { generateCashFlowContent } from "./generators/cashFlowGenerator";
import { generateExpenseSummaryContent } from "./generators/expenseSummaryGenerator";
import { 
  configurePdfMetadata, 
  addReportHeader, 
  addDateRangeInfo, 
  addPageNumbers, 
  generateReportFilename 
} from "./pdfUtils";

/**
 * Main function to generate a PDF report
 */
export const generateReportPdf = (reportData: ReportData): void => {
  const { title, period, dateRange, reportData: savedReportData } = reportData;
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add metadata
  configurePdfMetadata(doc, title, period);

  // Add title and period
  addReportHeader(doc, title, period);
  
  // Add report timeline if date range is provided
  if (dateRange) {
    addDateRangeInfo(doc, dateRange);
  }
  
  // If we have saved report data, use it directly instead of regenerating the report
  if (savedReportData) {
    // Generate report based on saved data
    // This is a simplified approach - in a production app, you'd implement
    // custom rendering logic for each report type using the saved data
    const reportTitle = title.toLowerCase().replace(/\s+/g, "-");
    generateGenericReportContent(doc, title, savedReportData);
    addPageNumbers(doc);
    const fileName = generateReportFilename(title);
    doc.save(fileName);
    return;
  }
  
  // Add report content based on report type
  switch (title.toLowerCase().replace(/\s+/g, "-")) {
    case "income-statement":
      generateIncomeStatementContent(doc);
      break;
    case "cash-flow":
    case "expense-summary":
    case "revenue-summary":
    case "budget-analysis":
    case "profit-loss":
      // For these reports, we'll use html2canvas to capture the entire report content
      setTimeout(() => {
        const reportId = `${title.toLowerCase().replace(/\s+/g, "-")}-report-content`;
        const reportContainer = document.getElementById(reportId);
        
        if (reportContainer) {
          import("html2canvas").then((html2canvasModule) => {
            const html2canvas = html2canvasModule.default;
            html2canvas(reportContainer, {
              scale: 2, // Higher quality
              useCORS: true,
              allowTaint: true,
              backgroundColor: "#ffffff",
            }).then(canvas => {
              const imgData = canvas.toDataURL('image/png');
              const imgProps = doc.getImageProperties(imgData);
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
              
              // Add the captured image to the PDF
              doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              
              // Add page numbers
              addPageNumbers(doc);
              
              // Save the PDF
              const fileName = generateReportFilename(title);
              doc.save(fileName);
            });
          });
        } else {
          // Fallback to generic content if container not found
          generateGenericReportContent(doc, title);
          // Add page numbers
          addPageNumbers(doc);
          // Save the PDF
          const fileName = generateReportFilename(title);
          doc.save(fileName);
        }
      }, 1000);
      return; // Return early as we're handling saving in the timeout
    default:
      generateGenericReportContent(doc, title);
      break;
  }
  
  // Add page numbers
  addPageNumbers(doc);
  
  // Save the PDF - only for reports that don't handle saving separately
  if (!["cash-flow", "expense-summary", "revenue-summary", "budget-analysis", "profit-loss"].includes(title.toLowerCase().replace(/\s+/g, "-"))) {
    const fileName = generateReportFilename(title);
    doc.save(fileName);
  }
};
