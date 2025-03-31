
import jsPDF from "jspdf";
import { format } from "date-fns";

/**
 * Configures PDF metadata
 */
export const configurePdfMetadata = (doc: jsPDF, title: string, period: string): void => {
  doc.setProperties({
    title: `${title} Report - ${period}`,
    subject: "Financial Report",
    creator: "Financial Management System",
    author: "System"
  });
};

/**
 * Adds title and period to the PDF
 */
export const addReportHeader = (doc: jsPDF, title: string, period: string): void => {
  // Set font styling
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  
  // Add title
  doc.text(`${title} Report`, 105, 20, { align: "center" });
  
  // Add report period
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Period: ${period}`, 105, 30, { align: "center" });
  
  // Add generation date
  const currentDate = format(new Date(), "MMMM dd, yyyy");
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 105, 38, { align: "center" });
};

/**
 * Adds date range information to the report
 */
export const addDateRangeInfo = (doc: jsPDF, dateRange: { startDate: Date; endDate: Date }): void => {
  const startDate = format(dateRange.startDate, "MMM dd, yyyy");
  const endDate = format(dateRange.endDate, "MMM dd, yyyy");
  
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 45, 170, 15, "F");
  doc.setFontSize(11);
  doc.text(`Report Period: ${startDate} - ${endDate}`, 105, 53, { align: "center" });
};

/**
 * Adds page numbers to the PDF
 */
export const addPageNumbers = (doc: jsPDF): void => {
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
  }
};

/**
 * Generates a filename for the report
 */
export const generateReportFilename = (title: string): string => {
  return `${title.toLowerCase().replace(/\s+/g, "-")}_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
};
