
/**
 * Billing information component for professional invoice template
 */
import jsPDF from "jspdf";
import { format } from "date-fns";
import { TemplateConfig } from "../types";

/**
 * Render billing info and date section with two columns
 */
export const renderBillingInfo = (
  doc: jsPDF,
  clientName: string,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  yPos: number,
  config: TemplateConfig,
  pageWidth: number
): number => {
  const { colors, margins } = config;
  const dateFormat = "dd MMM yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "N/A";
  
  // Set styling
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Left column - Billing info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("BILL TO", margins.left, yPos);
  
  // Add a colored underline
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 1, margins.left + 20, yPos + 1);
  
  // Client name
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, margins.left, yPos + 10);
  
  // Right column - Date information
  const rightCol = pageWidth / 2;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE DETAILS", rightCol, yPos);
  
  // Add a colored underline
  doc.line(rightCol, yPos + 1, rightCol + 40, yPos + 1);
  
  // Date details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Issue Date:", rightCol, yPos + 10);
  doc.text(issuedDateStr, rightCol + 70, yPos + 10);
  
  doc.text("Due Date:", rightCol, yPos + 20);
  doc.text(dueDateStr, rightCol + 70, yPos + 20);
  
  return yPos + 30;
};
