
/**
 * Default invoice template with modern, clean design
 */

import jsPDF from "jspdf";
import { format } from "date-fns";
import { InvoiceTemplateProps } from "./types";
import { formatNaira } from "../formatters";
import { DEFAULT_TEMPLATE_CONFIG } from "./templateConfig";

export const renderDefaultTemplate = (doc: jsPDF, props: InvoiceTemplateProps): void => {
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
  const config = DEFAULT_TEMPLATE_CONFIG;
  const { colors, margins } = config;
  
  // Set initial position
  let yPos = margins.top;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - margins.left - margins.right;
  
  // Document header with logo and invoice title
  renderHeader(doc, logoPreview, invoiceNumber, yPos, colors, margins);
  yPos += 30;
  
  // Invoice dates and client information
  yPos = renderDateAndClientInfo(doc, clientName, invoiceDate, dueDate, yPos, colors, margins);
  yPos += 15;
  
  // Invoice items table
  yPos = renderItemsTable(doc, invoiceItems, yPos, margins);
  yPos += 10;
  
  // Invoice summary (subtotal, tax, total)
  yPos = renderSummary(doc, subtotal, tax, total, yPos, colors, margins, pageWidth);
  yPos += 15;
  
  // Payment information
  if (bankName || accountName || accountNumber) {
    yPos = renderPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos, colors, margins);
    yPos += 15;
  }
  
  // Additional information
  if (additionalInfo) {
    renderAdditionalInfo(doc, additionalInfo, yPos, colors, margins);
  }
  
  // Add footer
  renderFooter(doc, colors);
};

/**
 * Render document header with logo and invoice title
 */
const renderHeader = (
  doc: jsPDF,
  logoPreview: string | null,
  invoiceNumber: string,
  yPos: number,
  colors: any,
  margins: any
): void => {
  // Set up header styling
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  
  // Add "INVOICE" title
  doc.text("INVOICE", margins.left, yPos + 10);
  
  // Add invoice number below the title
  doc.setFontSize(12);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(`#${invoiceNumber}`, margins.left, yPos + 18);
  
  // Add logo if available
  if (logoPreview && logoPreview.startsWith('data:image')) {
    try {
      const rightPosX = doc.internal.pageSize.width - margins.right - 40;
      doc.addImage(logoPreview, 'JPEG', rightPosX, yPos, 40, 20);
    } catch (error) {
      console.error("Error adding logo:", error);
      // Add a fallback colored rectangle if logo fails
      const rightPosX = doc.internal.pageSize.width - margins.right - 40;
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(rightPosX, yPos, 40, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("DigitBooks", rightPosX + 20, yPos + 12, { align: 'center' });
    }
  } else {
    // Add default company identifier if no logo
    const rightPosX = doc.internal.pageSize.width - margins.right - 40;
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(rightPosX, yPos, 40, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("DigitBooks", rightPosX + 20, yPos + 12, { align: 'center' });
  }
  
  // Add horizontal separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 25, doc.internal.pageSize.width - margins.right, yPos + 25);
};

/**
 * Render invoice dates and client information
 */
const renderDateAndClientInfo = (
  doc: jsPDF,
  clientName: string,
  invoiceDate: Date | undefined,
  dueDate: Date | undefined,
  yPos: number,
  colors: any,
  margins: any
): number => {
  const dateFormat = "dd MMM yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "N/A";
  
  // Set styling for this section
  doc.setFontSize(12);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Client information on the left
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", margins.left, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, margins.left, yPos + 18);
  
  // Date information on the right
  const rightCol = doc.internal.pageSize.width - margins.right - 80;
  
  // Issue date
  doc.setFont('helvetica', 'bold');
  doc.text("Issue Date:", rightCol, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(issuedDateStr, doc.internal.pageSize.width - margins.right, yPos + 10, { align: 'right' });
  
  // Due date
  doc.setFont('helvetica', 'bold');
  doc.text("Due Date:", rightCol, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(dueDateStr, doc.internal.pageSize.width - margins.right, yPos + 18, { align: 'right' });
  
  return yPos + 25;
};

/**
 * Render invoice items table
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
      fillColor: [5, 209, 102],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      lineWidth: 0.5,
      lineColor: [3, 74, 46]
    },
    bodyStyles: {
      fontSize: 10,
      lineColor: [220, 220, 220]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248]
    },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.1
  });
  
  return (doc as any).lastAutoTable.finalY;
};

/**
 * Render summary information (subtotal, tax, total)
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
  // Set styling for summary section
  doc.setFontSize(10);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Calculate positions
  const rightMargin = pageWidth - margins.right;
  const summaryX = rightMargin - 80;
  const valueX = rightMargin;
  
  // Add light background for the summary section
  doc.setFillColor(248, 248, 248);
  doc.rect(summaryX - 5, yPos, 85, 35, 'F');
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal:", summaryX, yPos + 10);
  doc.text(formatNaira(subtotal), valueX, yPos + 10, { align: 'right' });
  
  // Tax
  doc.text("Tax:", summaryX, yPos + 20);
  doc.text(formatNaira(tax), valueX, yPos + 20, { align: 'right' });
  
  // Separator line before total
  doc.setDrawColor(180, 180, 180);
  doc.line(summaryX - 5, yPos + 25, valueX, yPos + 25);
  
  // Total with distinct styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("Total:", summaryX, yPos + 35);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(formatNaira(total), valueX, yPos + 35, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  return yPos + 40;
};

/**
 * Render payment information section
 */
const renderPaymentInfo = (
  doc: jsPDF,
  bankName: string,
  accountName: string,
  accountNumber: string,
  swiftCode: string,
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Set up styling
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  
  // Add section title with accent
  doc.text("Payment Details", margins.left, yPos + 10);
  
  // Add colored accent line
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margins.left, yPos + 12, 30, 1, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(10);
  
  let detailYPos = yPos + 20;
  
  // Background for payment details
  if (bankName || accountName || accountNumber || swiftCode) {
    doc.setFillColor(248, 248, 248);
    const backgroundHeight = 10 + (bankName ? 10 : 0) + (accountName ? 10 : 0) + 
                             (accountNumber ? 10 : 0) + (swiftCode ? 10 : 0);
    doc.rect(margins.left, detailYPos - 5, 170, backgroundHeight, 'F');
  }
  
  // Bank name
  if (bankName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Bank Name:", margins.left + 5, detailYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(bankName, margins.left + 80, detailYPos);
    detailYPos += 10;
  }
  
  // Account name
  if (accountName) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Name:", margins.left + 5, detailYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountName, margins.left + 80, detailYPos);
    detailYPos += 10;
  }
  
  // Account number
  if (accountNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text("Account Number:", margins.left + 5, detailYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountNumber, margins.left + 80, detailYPos);
    detailYPos += 10;
  }
  
  // Swift code
  if (swiftCode) {
    doc.setFont('helvetica', 'bold');
    doc.text("Swift Code:", margins.left + 5, detailYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(swiftCode, margins.left + 80, detailYPos);
    detailYPos += 10;
  }
  
  return detailYPos + 5;
};

/**
 * Render additional information section
 */
const renderAdditionalInfo = (
  doc: jsPDF,
  additionalInfo: string,
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Set up styling
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  
  // Add section title with accent
  doc.text("Additional Information", margins.left, yPos + 10);
  
  // Add colored accent line
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margins.left, yPos + 12, 50, 1, 'F');
  
  // Reset styling for content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(10);
  
  // Add a light background
  doc.setFillColor(248, 248, 248);
  doc.rect(margins.left, yPos + 15, doc.internal.pageSize.width - margins.left - margins.right, 20, 'F');
  
  // Add the additional information text with proper wrapping
  const contentWidth = doc.internal.pageSize.width - margins.left - margins.right - 10;
  const textLines = doc.splitTextToSize(additionalInfo, contentWidth);
  doc.text(textLines, margins.left + 5, yPos + 25);
  
  return yPos + 30 + (textLines.length * 5);
};

/**
 * Render footer with thank you message
 */
const renderFooter = (doc: jsPDF, colors: any): void => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Add a decorative line
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(pageWidth / 2 - 40, pageHeight - 20, 80, 1, 'F');
  
  // Add thank you message
  doc.setFontSize(10);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont('helvetica', 'italic');
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 15, { align: "center" });
  
  // Add a powered by message
  doc.setFontSize(8);
  doc.text("Generated by DigitBooks", pageWidth / 2, pageHeight - 10, { align: "center" });
};
