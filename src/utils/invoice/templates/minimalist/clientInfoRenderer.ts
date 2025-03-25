
/**
 * Client information component for minimalist invoice template
 */
import jsPDF from "jspdf";
import { format } from "date-fns";

/**
 * Render client and date information in a clean two-column layout
 */
export const renderClientAndDateInfo = (
  doc: jsPDF,
  clientName: string,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  const dateFormat = "MMMM dd, yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "Not specified";
  
  // Client information (left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("BILL TO", margins.left, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, margins.left, yPos);
  
  // Date information (right)
  const rightCol = pageWidth - margins.right - 100;
  doc.setFont('helvetica', 'bold');
  doc.text("DATE", rightCol, yPos - 7);
  doc.text("DUE DATE", rightCol + 50, yPos - 7);
  
  doc.setFont('helvetica', 'normal');
  doc.text(issuedDateStr, rightCol, yPos);
  doc.text(dueDateStr, rightCol + 50, yPos);
  
  return yPos + 10;
};
