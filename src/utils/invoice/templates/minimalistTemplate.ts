
/**
 * Minimalist invoice template with clean, simple design
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { InvoiceTemplateProps } from "./types";
import { formatNaira } from "../formatters";
import { MINIMALIST_TEMPLATE_CONFIG } from "./templateConfig";

export const renderMinimalistTemplate = (doc: jsPDF, props: InvoiceTemplateProps): void => {
  const {
    logoPreview,
    invoiceItems,
    invoiceDate,
    dueDate,
    additionalInfo,
    bankName,
    accountNumber,
    swiftCode,
    accountName,
    clientName,
    invoiceNumber,
    subtotal,
    tax,
    total
  } = props;
  
  // Get template configuration
  const config = MINIMALIST_TEMPLATE_CONFIG;
  const { colors, margins } = config;
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  
  // Set fonts and colors for the entire document
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Starting position
  let yPos = margins.top;
  
  // Add minimalist header
  yPos = renderMinimalistHeader(doc, logoPreview, invoiceNumber, yPos, colors, margins, pageWidth);
  
  // Add horizontal divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 5, pageWidth - margins.right, yPos + 5);
  yPos += 15;
  
  // Add client and date info in a clean layout
  yPos = renderClientAndDateInfo(doc, clientName, invoiceDate, dueDate, yPos, colors, margins, pageWidth);
  yPos += 15;
  
  // Add invoice items with minimal styling
  yPos = renderMinimalistTable(doc, invoiceItems, yPos, colors, margins);
  yPos += 15;
  
  // Add totals with right alignment
  yPos = renderMinimalistSummary(doc, subtotal, tax, total, yPos, colors, margins, pageWidth);
  yPos += 20;
  
  // Add payment details if provided
  if (bankName || accountName || accountNumber) {
    yPos = renderMinimalistPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos, colors, margins);
    yPos += 15;
  }
  
  // Add notes if provided
  if (additionalInfo) {
    yPos = renderMinimalistNotes(doc, additionalInfo, yPos, colors, margins, pageWidth);
  }
  
  // Add minimal footer
  renderMinimalistFooter(doc, colors, pageWidth);
};

/**
 * Render minimalist header with logo and invoice number
 */
const renderMinimalistHeader = (
  doc: jsPDF,
  logoPreview: string | null,
  invoiceNumber: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Company identity (logo or name)
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      doc.addImage(logoPreview, 'JPEG', margins.left, yPos, 35, 18);
    } catch (error) {
      // Fallback to text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("DigitBooks", margins.left, yPos + 10);
    }
  } else {
    // Use text instead
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("DigitBooks", margins.left, yPos + 10);
  }
  
  // Invoice label and number with right alignment
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE", pageWidth - margins.right, yPos + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceNumber}`, pageWidth - margins.right, yPos + 12, { align: 'right' });
  
  return yPos + 20;
};

/**
 * Render client and date information in a clean two-column layout
 */
const renderClientAndDateInfo = (
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

/**
 * Render invoice items table with minimalist styling
 */
const renderMinimalistTable = (
  doc: jsPDF,
  invoiceItems: any[],
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Set up table headers and data
  const tableHeaders = ["Item", "Qty", "Price", "Tax", "Amount"];
  
  const tableBody = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatNaira(item.price),
    `${item.tax}%`,
    formatNaira(item.quantity * item.price)
  ]);
  
  // Create the table with minimal styling
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    margin: { left: margins.left, right: margins.right },
    headStyles: {
      fillColor: [255, 255, 255], // White background
      textColor: [80, 80, 80],    // Dark gray text
      fontSize: 10,
      fontStyle: 'bold',
      lineWidth: 0,
      lineColor: [220, 220, 220],
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 9,
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    didParseCell: (data: any) => {
      // Add subtle bottom border to header cells only
      if (data.row.index === 0) {
        data.cell.styles.lineWidth = [0, 0, 0.5, 0];
        data.cell.styles.lineColor = [220, 220, 220];
      }
    },
    tableLineColor: [255, 255, 255], // No border around table
    tableLineWidth: 0
  });
  
  return (doc as any).lastAutoTable.finalY;
};

/**
 * Render totals with clean right alignment
 */
const renderMinimalistSummary = (
  doc: jsPDF,
  subtotal: number,
  tax: number,
  total: number,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  const rightMargin = pageWidth - margins.right;
  const summaryX = rightMargin - 100;
  const valueX = rightMargin;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal", summaryX, yPos + 5);
  doc.text(formatNaira(subtotal), valueX, yPos + 5, { align: 'right' });
  
  // Tax
  doc.text("Tax", summaryX, yPos + 15);
  doc.text(formatNaira(tax), valueX, yPos + 15, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos + 20, valueX, yPos + 20);
  
  // Total with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Total", summaryX, yPos + 30);
  doc.text(formatNaira(total), valueX, yPos + 30, { align: 'right' });
  
  return yPos + 35;
};

/**
 * Render payment information with minimal styling
 */
const renderMinimalistPaymentInfo = (
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

/**
 * Render additional notes with minimalist style
 */
const renderMinimalistNotes = (
  doc: jsPDF,
  additionalInfo: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("NOTES", margins.left, yPos + 5);
  
  // Simple line separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 8, margins.left + 20, yPos + 8);
  
  // Notes content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const contentWidth = pageWidth - margins.left - margins.right - 10;
  const textLines = doc.splitTextToSize(additionalInfo, contentWidth);
  doc.text(textLines, margins.left, yPos + 15);
  
  return yPos + 20 + (textLines.length * 5);
};

/**
 * Render minimalist footer
 */
const renderMinimalistFooter = (doc: jsPDF, colors: any, pageWidth: number): void => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Thin separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, pageHeight - 15, pageWidth / 2 + 40, pageHeight - 15);
  
  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text("Thank you for your business", pageWidth / 2, pageHeight - 10, { align: "center" });
};
