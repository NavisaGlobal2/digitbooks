
/**
 * Header component for professional invoice template
 */
import jsPDF from "jspdf";
import { TemplateConfig } from "../types";

/**
 * Render the header section of the professional template
 */
export const renderHeader = (
  doc: jsPDF, 
  logoPreview: string | null, 
  invoiceNumber: string | undefined,
  config: TemplateConfig
): void => {
  const { colors, margins } = config;
  const pageWidth = doc.internal.pageSize.width;
  
  // Add header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo or company name
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      doc.addImage(logoPreview, 'JPEG', margins.left, 10, 30, 15);
    } catch (error) {
      renderCompanyName(doc, margins.left, 10, colors);
    }
  } else {
    renderCompanyName(doc, margins.left, 10, colors);
  }
  
  // Add invoice title on header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", pageWidth - margins.right, 20, { align: 'right' });
  
  // Add invoice number
  doc.setFontSize(12);
  doc.text(`#${invoiceNumber}`, pageWidth - margins.right, 30, { align: 'right' });
};

/**
 * Render company name when logo is not available
 */
export const renderCompanyName = (doc: jsPDF, x: number, y: number, colors: any): void => {
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text("DigitBooks", x, y + 10);
};
