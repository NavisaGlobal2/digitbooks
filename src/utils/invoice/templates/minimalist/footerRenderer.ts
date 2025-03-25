
/**
 * Footer component for minimalist invoice template
 */
import jsPDF from "jspdf";

/**
 * Render minimalist footer
 */
export const renderFooter = (doc: jsPDF, colors: any, pageWidth: number): void => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Thin separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, pageHeight - 15, pageWidth / 2 + 40, pageHeight - 15);
  
  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text("Thank you for your business", pageWidth / 2, pageHeight - 10, { align: "center" });
};
