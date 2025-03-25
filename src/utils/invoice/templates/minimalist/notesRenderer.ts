
/**
 * Notes component for minimalist invoice template
 */
import jsPDF from "jspdf";

/**
 * Render additional notes with minimalist style
 */
export const renderNotes = (
  doc: jsPDF,
  additionalInfo: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("NOTES", margins.left, yPos + 5);
  
  // Simple line separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 8, margins.left + 20, yPos + 8);
  
  // Notes content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const contentWidth = pageWidth - margins.left - margins.right - 10;
  const textLines = doc.splitTextToSize(additionalInfo, contentWidth);
  doc.text(textLines, margins.left, yPos + 15);
  
  return yPos + 20 + (textLines.length * 5);
};
