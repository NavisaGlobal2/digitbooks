
/**
 * Summary component for minimalist invoice template
 */
import jsPDF from "jspdf";
import { formatNaira } from "../../formatters";

/**
 * Render totals with clean right alignment
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
  const rightMargin = pageWidth - margins.right;
  const summaryX = rightMargin - 100;
  const valueX = rightMargin;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal", summaryX, yPos + 5);
  doc.text(formatNaira(subtotal), valueX, yPos + 5, { align: 'right' });
  
  // Tax
  doc.text("Tax", summaryX, yPos + 15);
  doc.text(formatNaira(tax), valueX, yPos + 15, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos + 20, valueX, yPos + 20);
  
  // Total with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Total", summaryX, yPos + 30);
  doc.text(formatNaira(total), valueX, yPos + 30, { align: 'right' });
  
  return yPos + 35;
};
