
/**
 * Header component for minimalist invoice template
 */
import jsPDF from "jspdf";

/**
 * Render minimalist header with logo and invoice number
 */
export const renderHeader = (
  doc: jsPDF,
  logoPreview: string | null,
  invoiceNumber: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Company identity (logo or name)
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      doc.addImage(logoPreview, 'JPEG', margins.left, yPos, 35, 18);
    } catch (error) {
      // Fallback to text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("DigitBooks", margins.left, yPos + 10);
    }
  } else {
    // Use text instead
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("DigitBooks", margins.left, yPos + 10);
  }
  
  // Invoice label and number with right alignment
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE", pageWidth - margins.right, yPos + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceNumber}`, pageWidth - margins.right, yPos + 12, { align: 'right' });
  
  return yPos + 20;
};
