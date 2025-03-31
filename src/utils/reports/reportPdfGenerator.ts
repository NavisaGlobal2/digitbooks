
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ReportData } from "./types/reportTypes";
import { generateIncomeStatementContent } from "./generators/incomeStatementGenerator";
import { generateGenericReportContent } from "./generators/genericReportGenerator";
import { generateCashFlowContent } from "./generators/cashFlowGenerator";
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
  const { title, period, dateRange } = reportData;
  
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
  
  // Add report content based on report type
  switch (title.toLowerCase().replace(/\s+/g, "-")) {
    case "income-statement":
      generateIncomeStatementContent(doc);
      break;
    case "cash-flow":
      generateCashFlowContent(doc);
      // Add page numbers after a delay to ensure content is rendered
      setTimeout(() => {
        addPageNumbers(doc);
        // Save the PDF
        const fileName = generateReportFilename(title);
        doc.save(fileName);
      }, 1500);
      return; // Return early as we're handling saving in the timeout
    case "revenue-summary":
    case "expense-summary":
    case "budget-analysis":
    case "profit-loss":
    default:
      generateGenericReportContent(doc, title);
      break;
  }
  
  // Add page numbers
  addPageNumbers(doc);
  
  // Save the PDF - only for non-cashflow reports since cashflow handles saving separately
  if (title.toLowerCase().replace(/\s+/g, "-") !== "cash-flow") {
    const fileName = generateReportFilename(title);
    doc.save(fileName);
  }
};
