
/**
 * Professional invoice template with business-focused design
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { InvoiceTemplateProps } from "./types";
import { formatNaira } from "../formatters";
import { PROFESSIONAL_TEMPLATE_CONFIG } from "./templateConfig";

export const renderProfessionalTemplate = (doc: jsPDF, props: InvoiceTemplateProps): void => {
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

  // Get the template configuration
  const config = PROFESSIONAL_TEMPLATE_CONFIG;
  const { colors, margins } = config;
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Add header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo or company name
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      doc.addImage(logoPreview, 'JPEG', margins.left, 10, 30, 15);
    } catch (error) {
      renderCompanyName(doc, margins.left, 10, colors);
    }
  } else {
    renderCompanyName(doc, margins.left, 10, colors);
  }
  
  // Add invoice title on header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", pageWidth - margins.right, 20, { align: 'right' });
  
  // Add invoice number
  doc.setFontSize(12);
  doc.text(`#${invoiceNumber}`, pageWidth - margins.right, 30, { align: 'right' });
  
  // Set starting position for content after header
  let yPos = 50;
  
  // Billing and date information with two-column layout
  yPos = renderBillingAndDateInfo(doc, clientName, invoiceDate, dueDate, yPos, colors, margins, pageWidth);
  
  // Invoice items table
  yPos = renderItemsTable(doc, invoiceItems, yPos + 10, margins);
  
  // Invoice summary on the right
  yPos = renderSummary(doc, subtotal, tax, total, yPos + 10, colors, margins, pageWidth);
  
  // Payment information in highlighted box
  if (bankName || accountName || accountNumber) {
    yPos = renderPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos + 10, colors, margins, pageWidth);
  }
  
  // Additional information in light container
  if (additionalInfo) {
    yPos = renderAdditionalInfo(doc, additionalInfo, yPos + 10, colors, margins, pageWidth);
  }
  
  // Footer
  renderFooter(doc, colors, pageWidth, pageHeight);
};

/**
 * Render company name when logo is not available
 */
const renderCompanyName = (doc: jsPDF, x: number, y: number, colors: any): void => {
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text("DigitBooks", x, y + 10);
};

/**
 * Render billing info and date section with two columns
 */
const renderBillingAndDateInfo = (
  doc: jsPDF,
  clientName: string,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  const dateFormat = "dd MMM yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "N/A";
  
  // Set styling
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Left column - Billing info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("BILL TO", margins.left, yPos);
  
  // Add a colored underline
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 1, margins.left + 20, yPos + 1);
  
  // Client name
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, margins.left, yPos + 10);
  
  // Right column - Date information
  const rightCol = pageWidth / 2;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE DETAILS", rightCol, yPos);
  
  // Add a colored underline
  doc.line(rightCol, yPos + 1, rightCol + 40, yPos + 1);
  
  // Date details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Issue Date:", rightCol, yPos + 10);
  doc.text(issuedDateStr, rightCol + 70, yPos + 10);
  
  doc.text("Due Date:", rightCol, yPos + 20);
  doc.text(dueDateStr, rightCol + 70, yPos + 20);
  
  return yPos + 30;
};

/**
 * Render invoice items table with improved formatting
 */
const renderItemsTable = (
  doc: jsPDF, 
  invoiceItems: any[],
  yPos: number,
  margins: any
): number => {
  // Transform the invoice items into table format
  const tableHeaders = [
    "Description", 
    "Qty", 
    "Unit Price", 
    "Tax (%)", 
    "Amount"
  ];
  
  const tableBody = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatNaira(item.price),
    `${item.tax}%`,
    formatNaira(item.quantity * item.price)
  ]);
  
  // Create the table
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    margin: { left: margins.left, right: margins.right },
    headStyles: {
      fillColor: [3, 74, 46], // Darker green for professional look
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      lineWidth: 0.5,
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 10,
      lineColor: [220, 220, 220],
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1
  });
  
  return (doc as any).lastAutoTable.finalY;
};

/**
 * Render summary information with bordered box
 */
const renderSummary = (
  doc: jsPDF,
  subtotal: number,
  tax: number,
  total: number,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Summary positioned on the right
  const rightMargin = pageWidth - margins.right;
  const summaryWidth = 100;
  const summaryX = rightMargin - summaryWidth;
  
  // Add border around summary
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(summaryX, yPos, summaryWidth, 45);
  
  // Add header for summary
  doc.setFillColor(240, 240, 240);
  doc.rect(summaryX, yPos, summaryWidth, 10, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text("INVOICE SUMMARY", summaryX + summaryWidth / 2, yPos + 7, { align: 'center' });
  
  // Summary content
  const labelX = summaryX + 5;
  const valueX = summaryX + summaryWidth - 5;
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal:", labelX, yPos + 20);
  doc.text(formatNaira(subtotal), valueX, yPos + 20, { align: 'right' });
  
  // Tax
  doc.text("Tax:", labelX, yPos + 30);
  doc.text(formatNaira(tax), valueX, yPos + 30, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.line(summaryX + 5, yPos + 35, summaryX + summaryWidth - 5, yPos + 35);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text("Total:", labelX, yPos + 43);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(formatNaira(total), valueX, yPos + 43, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  return yPos + 50;
};

/**
 * Render payment information with colored background
 */
const renderPaymentInfo = (
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

/**
 * Render additional information with light background
 */
const renderAdditionalInfo = (
  doc: jsPDF,
  additionalInfo: string,
  yPos: number,
  colors: any,
  margins: any,
  pageWidth: number
): number => {
  // Set styling
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Section title
  doc.text("Additional Information", margins.left, yPos + 10);
  
  // Add light background
  doc.setFillColor(248, 248, 248);
  doc.rect(margins.left, yPos + 15, pageWidth - margins.left - margins.right, 25, 'F');
  
  // Add content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const textLines = doc.splitTextToSize(
    additionalInfo, 
    pageWidth - margins.left - margins.right - 10
  );
  doc.text(textLines, margins.left + 5, yPos + 25);
  
  return yPos + 45;
};

/**
 * Render footer with professional design
 */
const renderFooter = (
  doc: jsPDF, 
  colors: any, 
  pageWidth: number, 
  pageHeight: number
): void => {
  // Add footer background
  doc.setFillColor(250, 250, 250);
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
  
  // Add a thin line above footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(0, pageHeight - 25, pageWidth, pageHeight - 25);
  
  // Add thank you message
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 15, { align: "center" });
  
  // Add a powered by message
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated by DigitBooks | www.digitbooks.com", pageWidth / 2, pageHeight - 8, { align: "center" });
};
