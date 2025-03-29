
import jsPDF from "jspdf";

/**
 * Renders a professional footer with company information and thank you message
 */
export const renderFooter = (
  doc: jsPDF, 
  colors: any, 
  pageWidth: number, 
  pageHeight: number
): void => {
  // Add a decorative footer bar
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  // Add thank you message
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text("Thank you for your business. We truly appreciate your partnership.", pageWidth / 2, pageHeight - 6, { align: "center" });
  
  // Add page number if needed
  doc.text("Page 1", pageWidth - 20, pageHeight - 6);
};
