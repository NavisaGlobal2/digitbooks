
import jsPDF from "jspdf";
import { PROFESSIONAL_TEMPLATE_CONFIG } from "../templateConfig";

/**
 * Renders the professional template header
 */
export const renderHeader = (doc: jsPDF, logoPreview: string | null, invoiceNumber: string | undefined, config: any): void => {
  // Set up header styling
  const { colors, margins } = config;
  const pageWidth = doc.internal.pageSize.width;
  
  // Draw header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add "INVOICE" title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", margins.left, 25);
  
  // Add invoice number below the title in a more professional style
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${invoiceNumber || 'Draft'}`, margins.left, 35);
  
  // Add logo if available
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      const rightPosX = pageWidth - margins.right - 50;
      doc.addImage(logoPreview, 'JPEG', rightPosX, 10, 40, 20);
    } catch (error) {
      console.error("Error adding logo:", error);
      
      // Add a fallback colored rectangle if logo fails
      const rightPosX = pageWidth - margins.right - 50;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightPosX, 10, 40, 20, 2, 2, 'F');
      
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(14);
      doc.text("DigitBooks", rightPosX + 20, 23, { align: 'center' });
    }
  }
};
