
import jsPDF from "jspdf";
import { format } from "date-fns";

/**
 * Renders billing information in a two-column layout
 */
export const renderBillingInfo = (
  doc: jsPDF,
  clientName: string,
  clientEmail: string | undefined,
  clientAddress: string | undefined,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  startY: number,
  config: any,
  pageWidth: number
): number => {
  const { margins, colors } = config;
  
  // Format dates
  const issueDateFormatted = invoiceDate ? format(invoiceDate, "PPP") : "Not specified";
  const dueDateFormatted = dueDate ? format(dueDate, "PPP") : "Not specified";
  
  // Set up styling
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Left column - Client information
  let yPos = startY + 8;
  
  // Client section title
  doc.setFontSize(12);
  doc.text("Bill To:", margins.left, yPos);
  yPos += 8;
  
  // Client details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, margins.left, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  if (clientAddress) {
    const addressLines = clientAddress.split(',');
    for (const line of addressLines) {
      doc.text(line.trim(), margins.left, yPos);
      yPos += 5;
    }
  }
  
  if (clientEmail) {
    doc.text(clientEmail, margins.left, yPos);
    yPos += 5;
  }
  
  // Right column - Date information
  const rightColX = pageWidth / 2 + 10;
  let rightYPos = startY + 8;
  
  // Date section title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Date Information:", rightColX, rightYPos);
  rightYPos += 8;
  
  // Date details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Issue date
  doc.text("Issue Date:", rightColX, rightYPos);
  doc.text(issueDateFormatted, rightColX + 60, rightYPos, { align: "left" });
  rightYPos += 6;
  
  // Due date
  doc.text("Due Date:", rightColX, rightYPos);
  doc.text(dueDateFormatted, rightColX + 60, rightYPos, { align: "left" });
  rightYPos += 6;
  
  // Return the maximum Y position between the two columns
  return Math.max(yPos, rightYPos);
};
