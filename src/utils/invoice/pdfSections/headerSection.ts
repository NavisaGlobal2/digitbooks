
/**
 * Functions for adding header elements to PDF invoices
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { 
  setupHeaderStyle, 
  setupNormalTextStyle,
  setupSubheaderStyle,
  setupBoldStyle,
  resetFontStyle
} from "../pdfStyles";

/**
 * Add company logo to the PDF with improved positioning
 * Returns the updated Y position
 */
export const addLogo = (doc: jsPDF, logoPreview: string | null, yPos: number): number => {
  const leftMargin = 15;
  
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      // Try to add the logo image with better sizing
      doc.addImage(logoPreview, 'JPEG', leftMargin, yPos, 40, 20);
      return yPos + 25;
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
      // Fall back to default logo if there's an error with the custom logo
      return addDefaultLogo(doc, leftMargin, yPos);
    }
  } else {
    // Add default logo if no custom logo
    return addDefaultLogo(doc, leftMargin, yPos);
  }
};

/**
 * Add default DigitBooks logo with improved styling
 * Returns the updated Y position
 */
const addDefaultLogo = (doc: jsPDF, x: number, y: number): number => {
  try {
    // Use the new logo
    doc.setDrawColor(5, 209, 102); // Brand green color
    doc.setFillColor(5, 209, 102);
    doc.roundedRect(x, y, 40, 15, 2, 2, 'F');
    
    // Add company name with better contrast
    setupHeaderStyle(doc);
    doc.setTextColor(255, 255, 255); // White text on green background
    doc.text("DigitBooks", x + 20, y + 10, { align: 'center' });
    doc.setTextColor(44, 62, 80); // Reset text color
    
    return y + 20;
  } catch (error) {
    console.error("Error adding default logo to PDF:", error);
    
    // Fallback to drawing a simple logo if the image fails to load
    doc.setDrawColor(5, 209, 102); // Brand green color
    doc.setFillColor(5, 209, 102);
    doc.roundedRect(x, y, 40, 15, 2, 2, 'F');
    
    // Add company name with better contrast
    setupHeaderStyle(doc);
    doc.setTextColor(255, 255, 255); // White text on green background
    doc.text("DigitBooks", x + 20, y + 10, { align: 'center' });
    doc.setTextColor(44, 62, 80); // Reset text color
    
    return y + 20;
  }
};

/**
 * Add invoice header with title and number in a better layout
 * Returns the updated Y position
 */
export const addInvoiceHeader = (doc: jsPDF, invoiceNumber: string, yPos: number): number => {
  const pageWidth = doc.internal.pageSize.width;
  const rightMargin = pageWidth - 15;
  
  // Add a decorative element
  doc.setFillColor(5, 209, 102);
  doc.rect(pageWidth / 2 - 15, yPos - 5, 30, 2, 'F');
  
  setupHeaderStyle(doc);
  doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  setupNormalTextStyle(doc);
  setupBoldStyle(doc);
  doc.text(`Invoice #: ${invoiceNumber}`, rightMargin, yPos, { align: "right" });
  resetFontStyle(doc);
  
  return yPos + 8;
};

/**
 * Add dates to the invoice with improved formatting
 * Returns the updated Y position
 */
export const addDates = (doc: jsPDF, invoiceDate: Date | undefined, dueDate: Date | undefined, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  
  const issuedDateStr = invoiceDate ? format(invoiceDate, "MMMM dd, yyyy") : format(new Date(), "MMMM dd, yyyy");
  const dueDateStr = dueDate ? format(dueDate, "MMMM dd, yyyy") : "N/A";
  
  setupNormalTextStyle(doc);
  
  // Add date labels with better formatting
  setupBoldStyle(doc);
  doc.text("Issued:", rightMargin - 70, yPos);
  resetFontStyle(doc);
  doc.text(issuedDateStr, rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  setupBoldStyle(doc);
  doc.text("Due:", rightMargin - 70, yPos);
  resetFontStyle(doc);
  doc.text(dueDateStr, rightMargin, yPos, { align: "right" });
  
  return yPos + 15;
};

/**
 * Add client information to the invoice with improved layout
 * Returns the updated Y position
 */
export const addClientInfo = (doc: jsPDF, clientName: string, yPos: number): number => {
  const leftMargin = 15;
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Bill To:", leftMargin, yPos);
  resetFontStyle(doc);
  yPos += 8;
  
  setupBoldStyle(doc);
  doc.text(clientName, leftMargin, yPos);
  resetFontStyle(doc);
  
  // Add a light gray box around client info
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(leftMargin - 3, yPos - 15, 80, 20, 2, 2, 'FD');
  
  // Re-add the text on top of the background
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Bill To:", leftMargin, yPos - 8);
  resetFontStyle(doc);
  
  setupBoldStyle(doc);
  doc.text(clientName, leftMargin, yPos);
  resetFontStyle(doc);
  
  return yPos + 15;
};
