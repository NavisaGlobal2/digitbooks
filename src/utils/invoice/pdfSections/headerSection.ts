
/**
 * Functions for adding header elements to PDF invoices
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { 
  setupHeaderStyle, 
  setupNormalTextStyle,
  setupSubheaderStyle
} from "../pdfStyles";

/**
 * Add company logo to the PDF
 * Returns the updated Y position
 */
export const addLogo = (doc: jsPDF, logoPreview: string | null, yPos: number): number => {
  const leftMargin = 15;
  
  if (logoPreview) {
    try {
      doc.addImage(logoPreview, 'PNG', leftMargin, yPos, 40, 20);
      return yPos + 25;
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
      // Fall back to default logo if there's an error with the custom logo
      addDefaultLogo(doc, leftMargin, yPos);
      return yPos + 25;
    }
  } else {
    // Add default logo if no custom logo
    addDefaultLogo(doc, leftMargin, yPos);
    return yPos + 25;
  }
};

/**
 * Add default DigitBooks logo
 */
const addDefaultLogo = (doc: jsPDF, x: number, y: number) => {
  // Draw the book outline
  doc.setDrawColor(0, 200, 83); // Green color #00C853
  doc.setLineWidth(0.5);
  doc.rect(x, y, 10, 15);
  
  // Draw the page divider
  doc.line(x + 5, y, x + 5, y + 15);
  
  // Add company name
  setupHeaderStyle(doc);
  doc.setTextColor(51, 51, 51); // Dark gray
  doc.text("DigitBooks", x + 15, y + 7);
};

/**
 * Add invoice header with title and number
 * Returns the updated Y position
 */
export const addInvoiceHeader = (doc: jsPDF, invoiceNumber: string, yPos: number): number => {
  const pageWidth = doc.internal.pageSize.width;
  const rightMargin = pageWidth - 15;
  
  setupHeaderStyle(doc);
  doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  setupNormalTextStyle(doc);
  doc.text(`Invoice #: ${invoiceNumber}`, rightMargin, yPos, { align: "right" });
  
  return yPos + 8;
};

/**
 * Add dates to the invoice
 * Returns the updated Y position
 */
export const addDates = (doc: jsPDF, invoiceDate: Date | undefined, dueDate: Date | undefined, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  
  const issuedDateStr = invoiceDate ? format(invoiceDate, "MMMM dd, yyyy") : format(new Date(), "MMMM dd, yyyy");
  const dueDateStr = dueDate ? format(dueDate, "MMMM dd, yyyy") : "N/A";
  
  setupNormalTextStyle(doc);
  doc.text(`Issued: ${issuedDateStr}`, rightMargin, yPos, { align: "right" });
  yPos += 7;
  doc.text(`Due: ${dueDateStr}`, rightMargin, yPos, { align: "right" });
  
  return yPos + 15;
};

/**
 * Add client information to the invoice
 * Returns the updated Y position
 */
export const addClientInfo = (doc: jsPDF, clientName: string, yPos: number): number => {
  const leftMargin = 15;
  
  setupNormalTextStyle(doc);
  doc.text("Bill To:", leftMargin, yPos);
  yPos += 7;
  
  setupSubheaderStyle(doc);
  doc.text(clientName, leftMargin, yPos);
  
  return yPos + 15;
};
