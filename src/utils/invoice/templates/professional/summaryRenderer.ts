
/**
 * Invoice summary component for professional invoice template
 */
import jsPDF from "jspdf";
import { formatNaira } from "../../formatters";

/**
 * Render summary information with bordered box
 */
export const renderSummary = (
  doc: jsPDF,
  subtotal: number,
  tax: number,
  total: number,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Summary positioned on the right
  const rightMargin = pageWidth - margins.right;
  const summaryWidth = 100;
  const summaryX = rightMargin - summaryWidth;
  
  // Add border around summary
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(summaryX, yPos, summaryWidth, 45);
  
  // Add header for summary
  doc.setFillColor(240, 240, 240);
  doc.rect(summaryX, yPos, summaryWidth, 10, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text("INVOICE SUMMARY", summaryX + summaryWidth / 2, yPos + 7, { align: 'center' });
  
  // Summary content
  const labelX = summaryX + 5;
  const valueX = summaryX + summaryWidth - 5;
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal:", labelX, yPos + 20);
  doc.text(formatNaira(subtotal), valueX, yPos + 20, { align: 'right' });
  
  // Tax
  doc.text("Tax:", labelX, yPos + 30);
  doc.text(formatNaira(tax), valueX, yPos + 30, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(summaryX + 5, yPos + 35, summaryX + summaryWidth - 5, yPos + 35);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text("Total:", labelX, yPos + 43);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(formatNaira(total), valueX, yPos + 43, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  return yPos + 50;
};
