
/**
 * Payment information component for professional invoice template
 */
import jsPDF from "jspdf";

/**
 * Render payment information with colored background
 */
export const renderPaymentInfo = (
  doc: jsPDF,
  bankName: string,
  accountName: string,
  accountNumber: string,
  swiftCode: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Set a light colored background for the payment section
  doc.setFillColor(245, 250, 245); // Light green tint
  doc.rect(margins.left, yPos, pageWidth - margins.left - margins.right, 60, 'F');
  
  // Add a colored bar on the left
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margins.left, yPos, 5, 60, 'F');
  
  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Payment Information", margins.left + 15, yPos + 15);
  
  // Reset text color for details
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(10);
  
  let detailYPos = yPos + 25;
  const labelX = margins.left + 15;
  const valueX = margins.left + 100;
  
  // Payment details in two columns
  if (bankName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Bank Name:", labelX, detailYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(bankName, valueX, detailYPos);
  }
  
  if (accountName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Name:", labelX, detailYPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(accountName, valueX, detailYPos + 10);
  }
  
  if (accountNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Number:", labelX, detailYPos + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(accountNumber, valueX, detailYPos + 20);
  }
  
  if (swiftCode) {
    doc.setFont('helvetica', 'bold');
    doc.text("Swift Code:", labelX, detailYPos + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(swiftCode, valueX, detailYPos + 30);
  }
  
  return yPos + 65;
};
