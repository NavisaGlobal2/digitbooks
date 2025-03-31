
import jsPDF from "jspdf";
// Import the autoTable plugin properly
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
import html2canvas from "html2canvas";

// Create type augmentation for jsPDF to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Main function to generate a PDF report
 */
export const generateReportPdf = async (reportData: ReportData): Promise<void> => {
  const { title, period, dateRange, reportData: savedReportData } = reportData;
  
  console.log("Generating PDF for report:", title);
  console.log("With date range:", dateRange);
  
  try {
    // First try to capture the report from DOM if possible
    const reportElement = document.getElementById("report-container");
    if (reportElement) {
      console.log("Found report container, attempting to capture snapshot");
      try {
        // Create a new PDF document with appropriate dimensions
        const doc = new jsPDF();
        
        // Verify that autoTable is available
        if (typeof doc.autoTable !== 'function') {
          console.error("jsPDF autoTable plugin is not properly loaded");
          throw new Error("PDF generation failed: AutoTable plugin not available");
        }

        // Add metadata
        configurePdfMetadata(doc, title, period);
        
        // Capture the report content as an image
        const canvas = await html2canvas(reportElement, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        
        // Get dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add the image to the PDF
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Save the PDF
        const fileName = generateReportFilename(title);
        console.log("Saving snapshot PDF with filename:", fileName);
        doc.save(fileName);
        return;
      } catch (error) {
        console.error("Error capturing report snapshot, falling back to generation:", error);
        // Will fall back to traditional generation below
      }
    } else {
      console.log("No report-container element found, using standard generation");
    }
    
    // Create a new PDF document (fallback method)
    const doc = new jsPDF();
    
    // Verify that autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.error("jsPDF autoTable plugin is not properly loaded");
      throw new Error("PDF generation failed: AutoTable plugin not available");
    }
    
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
      console.log("Using saved report data for:", title);
      // Generate report based on saved data
      // This is a simplified approach - in a production app, you'd implement
      // custom rendering logic for each report type using the saved data
      generateGenericReportContent(doc);
      addPageNumbers(doc);
      const fileName = generateReportFilename(title);
      doc.save(fileName);
      return;
    }
    
    console.log("Generating report content for:", title.toLowerCase().replace(/\s+/g, "-"));
    
    // Add report content based on report type
    const reportType = title.toLowerCase().replace(/\s+/g, "-");
    switch (reportType) {
      case "income-statement":
        generateIncomeStatementContent(doc);
        break;
      case "cash-flow":
        generateCashFlowContent(doc);
        break;
      case "expense-summary":
        generateExpenseSummaryContent(doc);
        break;
      case "revenue-summary":
      case "budget-analysis":
      case "profit-loss":
      default:
        generateGenericReportContent(doc);
        break;
    }
    
    // Add page numbers
    addPageNumbers(doc);
    
    // Save the PDF
    const fileName = generateReportFilename(title);
    console.log("Saving PDF with filename:", fileName);
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error; // Re-throw to allow handling by the UI
  }
};
