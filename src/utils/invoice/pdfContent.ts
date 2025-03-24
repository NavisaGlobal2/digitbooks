
/**
 * Utility functions for adding content to PDF invoices
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "./formatters";
import { setupHeaderStyle, setupSubheaderStyle, setupNormalTextStyle, setupBoldStyle, resetFontStyle, getTableHeaderStyles, getTableColumnStyles } from "./pdfStyles";

interface InvoiceDetails {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate?: Date;
  dueDate?: Date;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  accountName: string;
  clientName?: string;
  invoiceNumber?: string;
}

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
    }
  } else {
    // Add company name if no logo
    setupHeaderStyle(doc);
    doc.text("Your Company", leftMargin, yPos);
    return yPos + 10;
  }
  
  return yPos;
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

/**
 * Add invoice items table
 * Returns the updated Y position
 */
export const addInvoiceItems = (doc: jsPDF, invoiceItems: InvoiceItem[], yPos: number): number => {
  const leftMargin = 15;
  setupNormalTextStyle(doc);
  
  // Transform the invoice items into a format that jspdf-autotable can use
  const tableHeaders = [
    { header: "Description", dataKey: "desc" },
    { header: "Quantity", dataKey: "qty" },
    { header: "Unit Price", dataKey: "price" },
    { header: "Tax (%)", dataKey: "tax" },
    { header: "Amount", dataKey: "amount" }
  ];
  
  const tableData = invoiceItems.map(item => ({
    desc: item.description,
    qty: item.quantity.toString(),
    price: formatNaira(item.price),
    tax: `${item.tax}%`,
    amount: formatNaira(item.quantity * item.price)
  }));
  
  // Add the table
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders.map(h => h.header)],
    body: tableData.map(row => [
      row.desc,
      row.qty,
      row.price,
      row.tax,
      row.amount
    ]),
    theme: 'grid',
    headStyles: getTableHeaderStyles(),
    columnStyles: getTableColumnStyles(),
    margin: { left: leftMargin, right: 15 }
  });
  
  // Get the Y position after the table
  return (doc as any).lastAutoTable.finalY + 10;
};

/**
 * Add invoice summary (subtotal, tax, total)
 * Returns the updated Y position
 */
export const addInvoiceSummary = (doc: jsPDF, subtotal: number, tax: number, total: number, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  const rightColumnX = rightMargin - 50;
  
  setupNormalTextStyle(doc);
  
  doc.text("Subtotal:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(subtotal), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  doc.text("Tax:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(tax), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Total:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(total), rightMargin, yPos, { align: "right" });
  resetFontStyle(doc);
  
  return yPos + 15;
};

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
