
import jsPDF from "jspdf";
import { format } from "date-fns";

/**
 * Renders the billing and date information for the professional template
 */
export const renderBillingInfo = (
  doc: jsPDF,
  clientName: string,
  clientEmail: string | undefined,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  yPos: number,
  config: any,
  pageWidth: number
): number => {
  const dateFormat = "dd MMM yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "N/A";
  
  // Set styling for this section
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  // Background for the billing section
  doc.setFillColor(248, 248, 250);
  doc.rect(0, yPos, pageWidth, 50, 'F');
  
  // Client information on the left
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", config.margins.left, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, config.margins.left, yPos + 25);
  
  if (clientEmail) {
    doc.text(clientEmail, config.margins.left, yPos + 35);
  }
  
  // Date information on the right in a clean column layout
  const rightCol = pageWidth - config.margins.right - 80;
  
  doc.setFont('helvetica', 'bold');
  doc.text("Issue Date:", rightCol, yPos + 15);
  doc.text("Due Date:", rightCol, yPos + 25);
  
  doc.setFont('helvetica', 'normal');
  doc.text(issuedDateStr, pageWidth - config.margins.right, yPos + 15, { align: 'right' });
  doc.text(dueDateStr, pageWidth - config.margins.right, yPos + 25, { align: 'right' });
  
  return yPos + 50;
};
