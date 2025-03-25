
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
      // Try to add the logo image with better sizing and positioning
      doc.addImage(logoPreview, 'JPEG', leftMargin, yPos, 45, 25);
      return yPos + 30; // Ensure enough space after the logo
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
    // Use the new logo with better sizing and rounded corners
    doc.setDrawColor(5, 209, 102); // Brand green color
    doc.setFillColor(5, 209, 102);
    doc.roundedRect(x, y, 45, 20, 3, 3, 'F');
    
    // Add company name with better contrast and positioning
    setupHeaderStyle(doc);
    doc.setTextColor(255, 255, 255); // White text on green background
    doc.text("DigitBooks", x + 22.5, y + 13, { align: 'center' });
    doc.setTextColor(44, 62, 80); // Reset text color
    
    return y + 30; // Ensure enough space after the logo
  } catch (error) {
    console.error("Error adding default logo to PDF:", error);
    
    // Fallback to drawing a simple logo if the image fails to load
    doc.setDrawColor(5, 209, 102); // Brand green color
    doc.setFillColor(5, 209, 102);
    doc.roundedRect(x, y, 45, 20, 3, 3, 'F');
    
    // Add company name with better contrast
    setupHeaderStyle(doc);
    doc.setTextColor(255, 255, 255); // White text on green background
    doc.text("DigitBooks", x + 22.5, y + 13, { align: 'center' });
    doc.setTextColor(44, 62, 80); // Reset text color
    
    return y + 30; // Ensure enough space after the logo
  }
};

/**
 * Add invoice header with title and number in a better layout
 * Returns the updated Y position
 */
export const addInvoiceHeader = (doc: jsPDF, invoiceNumber: string, yPos: number): number => {
  const pageWidth = doc.internal.pageSize.width;
  const rightMargin = pageWidth - 15;
  
  // Add a decorative element with better styling
  doc.setFillColor(5, 209, 102);
  doc.rect(pageWidth / 2 - 20, yPos - 5, 40, 3, 'F');
  
  setupHeaderStyle(doc);
  doc.text("INVOICE", pageWidth / 2, yPos + 5, { align: "center" });
  yPos += 15;
  
  setupNormalTextStyle(doc);
  setupBoldStyle(doc);
  doc.setFontSize(13); // Slightly larger for visibility
  doc.text(`Invoice #: ${invoiceNumber}`, rightMargin, yPos, { align: "right" });
  resetFontStyle(doc);
  doc.setFontSize(11); // Reset font size
  
  return yPos + 12;
};

/**
 * Add dates to the invoice with improved formatting and alignment
 * Returns the updated Y position
 */
export const addDates = (doc: jsPDF, invoiceDate: Date | undefined, dueDate: Date | undefined, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  
  const issuedDateStr = invoiceDate ? format(invoiceDate, "MMMM dd, yyyy") : format(new Date(), "MMMM dd, yyyy");
  const dueDateStr = dueDate ? format(dueDate, "MMMM dd, yyyy") : "N/A";
  
  setupNormalTextStyle(doc);
  
  // Create a consistent layout for date information
  setupBoldStyle(doc);
  doc.text("Date Issued:", rightMargin - 80, yPos);
  resetFontStyle(doc);
  doc.text(issuedDateStr, rightMargin, yPos, { align: "right" });
  yPos += 8;
  
  setupBoldStyle(doc);
  doc.text("Due Date:", rightMargin - 80, yPos);
  resetFontStyle(doc);
  doc.text(dueDateStr, rightMargin, yPos, { align: "right" });
  
  return yPos + 20; // Add more space after dates
};

/**
 * Add client information to the invoice with improved layout
 * Returns the updated Y position
 */
export const addClientInfo = (doc: jsPDF, clientName: string, yPos: number): number => {
  const leftMargin = 15;
  
  // Add a light background for client info with better styling
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(leftMargin - 3, yPos - 5, 100, 30, 2, 2, 'F');
  
  // Add a subtle border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.roundedRect(leftMargin - 3, yPos - 5, 100, 30, 2, 2);
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Bill To:", leftMargin + 5, yPos + 5);
  resetFontStyle(doc);
  
  setupBoldStyle(doc);
  doc.setFontSize(13); // Larger font for client name
  doc.text(clientName, leftMargin + 5, yPos + 20);
  resetFontStyle(doc);
  doc.setFontSize(11); // Reset font size
  
  return yPos + 40; // Add more space after client info
};
