
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ChartData, ReportData } from "../types/reportTypes";
import html2canvas from "html2canvas";

/**
 * Generates the content for a Cash Flow report
 */
export const generateCashFlowReportContent = async (doc: jsPDF, reportData?: ReportData): Promise<void> => {
  if (!reportData || !reportData.cashflowData) {
    // If no data is provided, use sample data
    return generateSampleCashFlowReport(doc);
  }

  try {
    // Find the Cash Flow Report element in the DOM to capture it
    const reportElement = document.querySelector('.cash-flow-report-container');
    
    if (!reportElement) {
      console.error("Cash Flow report element not found in the DOM");
      return generateSampleCashFlowReport(doc);
    }

    // Create a clone of the report element to avoid capturing interactive elements
    const clone = reportElement.cloneNode(true) as HTMLElement;
    
    // Set styles for the clone to ensure proper rendering
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = `${reportElement.clientWidth}px`;
    clone.style.height = 'auto';
    clone.style.backgroundColor = 'white';
    clone.style.overflow = 'visible';
    
    // Remove any buttons, navigation, or interactive elements from the clone
    clone.querySelectorAll('button, a, .print\\:hidden').forEach(el => {
      el.remove();
    });
    
    // Append clone to body temporarily
    document.body.appendChild(clone);
    
    // Use html2canvas with improved settings
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false, // Disable logging
      backgroundColor: "#ffffff", // Set white background
      ignoreElements: (element) => {
        // Skip elements that shouldn't be in PDF
        const style = window.getComputedStyle(element);
        return style.display === "none" || 
               style.visibility === "hidden" || 
               style.opacity === "0" ||
               element.classList.contains('print:hidden');
      }
    });

    // Remove the clone from the DOM
    document.body.removeChild(clone);

    // Calculate dimensions to fit the PDF page
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Calculate proportional height to maintain aspect ratio
    const canvasAspectRatio = canvas.height / canvas.width;
    const imgWidth = pageWidth - 20; // 10pt margin on each side
    const imgHeight = imgWidth * canvasAspectRatio;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Cash Flow Report", 105, 20, { align: "center" });
    
    // Add period
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${reportData.period || "Current Period"}`, 105, 30, { align: "center" });
    
    // Add the captured image
    doc.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
    
    // Add generation date at bottom
    const currentDate = format(new Date(), "MMMM dd, yyyy");
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 105, pageHeight - 10, { align: "center" });
    
  } catch (error) {
    console.error("Error generating Cash Flow report:", error);
    return generateSampleCashFlowReport(doc);
  }
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
