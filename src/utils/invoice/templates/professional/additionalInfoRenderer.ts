
/**
 * Additional information component for professional invoice template
 */
import jsPDF from "jspdf";

/**
 * Render additional information with light background
 */
export const renderAdditionalInfo = (
  doc: jsPDF,
  additionalInfo: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Set styling
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Section title
  doc.text("Additional Information", margins.left, yPos + 10);
  
  // Add light background
  doc.setFillColor(248, 248, 248);
  doc.rect(margins.left, yPos + 15, pageWidth - margins.left - margins.right, 25, 'F');
  
  // Add content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const textLines = doc.splitTextToSize(
    additionalInfo, 
    pageWidth - margins.left - margins.right - 10
  );
  doc.text(textLines, margins.left + 5, yPos + 25);
  
  return yPos + 45;
};
