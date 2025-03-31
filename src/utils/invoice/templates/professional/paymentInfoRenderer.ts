
/**
 * Payment information component for professional invoice template
 */
import jsPDF from "jspdf";

/**
 * Render payment information with professional styling
 */
export const renderPaymentInfo = (
  doc: jsPDF,
  bankName: string,
  accountName: string,
  accountNumber: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Add a section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Payment Information", margins.left, yPos + 10);
  
  // Add a colored background for the payment information
  doc.setFillColor(250, 250, 250);
  doc.rect(margins.left, yPos + 15, pageWidth - margins.left - margins.right, 40, 'F');
  
  // Add a colored accent on the left side
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margins.left, yPos + 15, 5, 40, 'F');
  
  // Add the payment details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  const detailsX = margins.left + 20;
  let detailsY = yPos + 30;
  
  // Bank name
  if (bankName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Bank Name:", detailsX, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(bankName, detailsX + 80, detailsY);
    detailsY += 10;
  }
  
  // Account name
  if (accountName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Name:", detailsX, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(accountName, detailsX + 80, detailsY);
    detailsY += 10;
  }
  
  // Account number
  if (accountNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Number:", detailsX, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(accountNumber, detailsX + 80, detailsY);
    detailsY += 10;
  }
  
  return yPos + 60;
};
