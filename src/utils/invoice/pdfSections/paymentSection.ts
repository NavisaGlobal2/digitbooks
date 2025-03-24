
/**
 * Functions for adding payment information to PDF invoices
 */

import jsPDF from "jspdf";
import { 
  setupNormalTextStyle,
  setupSubheaderStyle,
  setupFooterStyle
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
  doc.text("Payment Information", leftMargin, yPos);
  yPos += 8;
  
  setupNormalTextStyle(doc);
  doc.text(`Bank: ${bankName}`, leftMargin, yPos);
  yPos += 7;
  doc.text(`Account Name: ${accountName}`, leftMargin, yPos);
  yPos += 7;
  doc.text(`Account Number: ${accountNumber}`, leftMargin, yPos);
  yPos += 7;
  
  if (swiftCode) {
    doc.text(`Swift Code: ${swiftCode}`, leftMargin, yPos);
    yPos += 7;
  }
  
  return yPos;
};

/**
 * Add additional information section
 * Returns the updated Y position
 */
export const addAdditionalInfo = (doc: jsPDF, additionalInfo: string, yPos: number): number => {
  if (!additionalInfo) return yPos;
  
  const leftMargin = 15;
  const rightMargin = doc.internal.pageSize.width - 15;
  
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;
  
  setupSubheaderStyle(doc);
  doc.text("Additional Information", leftMargin, yPos);
  yPos += 8;
  
  setupNormalTextStyle(doc);
  // Split long text into multiple lines
  const textLines = doc.splitTextToSize(additionalInfo, rightMargin - leftMargin);
  doc.text(textLines, leftMargin, yPos);
  
  return yPos + textLines.length * 7;
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
