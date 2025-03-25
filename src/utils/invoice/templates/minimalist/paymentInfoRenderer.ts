
/**
 * Payment information component for minimalist invoice template
 */
import jsPDF from "jspdf";

/**
 * Render payment information with minimal styling
 */
export const renderPaymentInfo = (
  doc: jsPDF,
  bankName: string,
  accountName: string,
  accountNumber: string,
  swiftCode: string,
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("PAYMENT DETAILS", margins.left, yPos + 5);
  
  // Simple line separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 8, margins.left + 40, yPos + 8);
  
  // Payment details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let detailYPos = yPos + 15;
  
  if (bankName) {
    doc.text(`Bank: ${bankName}`, margins.left, detailYPos);
    detailYPos += 7;
  }
  
  if (accountName) {
    doc.text(`Account Name: ${accountName}`, margins.left, detailYPos);
    detailYPos += 7;
  }
  
  if (accountNumber) {
    doc.text(`Account Number: ${accountNumber}`, margins.left, detailYPos);
    detailYPos += 7;
  }
  
  if (swiftCode) {
    doc.text(`Swift Code: ${swiftCode}`, margins.left, detailYPos);
    detailYPos += 7;
  }
  
  return detailYPos;
};
