
/**
 * Functions for adding payment information to PDF invoices
 */

import jsPDF from "jspdf";
import { 
  setupNormalTextStyle,
  setupSubheaderStyle,
  setupFooterStyle,
  setupBoldStyle,
  resetFontStyle
} from "../pdfStyles";

/**
 * Add payment information
 * Returns the updated Y position
 */
export const addPaymentInfo = (doc: jsPDF, bankName: string, accountName: string, accountNumber: string, swiftCode: string, yPos: number): number => {
  const leftMargin = 15;
  const rightMargin = doc.internal.pageSize.width - 15;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Bank Details", leftMargin, yPos);
  resetFontStyle(doc);
  yPos += 8;
  
  setupNormalTextStyle(doc);
  
  if (bankName) {
    doc.text("Bank Name:", leftMargin, yPos);
    doc.text(bankName, leftMargin + 80, yPos);
    yPos += 7;
  }
  
  if (accountName) {
    doc.text("Account Name:", leftMargin, yPos);
    doc.text(accountName, leftMargin + 80, yPos);
    yPos += 7;
  }
  
  if (accountNumber) {
    doc.text("Account Number:", leftMargin, yPos);
    doc.text(accountNumber, leftMargin + 80, yPos);
    yPos += 7;
  }
  
  if (swiftCode) {
    doc.text("Swift Code:", leftMargin, yPos);
    doc.text(swiftCode, leftMargin + 80, yPos);
    yPos += 7;
  }
  
  return yPos + 5;
};

/**
 * Add additional information section
 * Returns the updated Y position
 */
export const addAdditionalInfo = (doc: jsPDF, additionalInfo: string, yPos: number): number => {
  if (!additionalInfo) return yPos;
  
  const leftMargin = 15;
  const rightMargin = doc.internal.pageSize.width - 15;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Additional Information", leftMargin, yPos);
  resetFontStyle(doc);
  yPos += 8;
  
  setupNormalTextStyle(doc);
  // Split long text into multiple lines
  const textLines = doc.splitTextToSize(additionalInfo, rightMargin - leftMargin);
  doc.text(textLines, leftMargin, yPos);
  
  return yPos + (textLines.length * 7);
};

/**
 * Add footer with thank you message
 */
export const addFooter = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  setupFooterStyle(doc);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, { align: "center" });
};
