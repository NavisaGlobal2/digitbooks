
/**
 * Main entry point for minimalist invoice template
 */
import jsPDF from "jspdf";
import { InvoiceTemplateProps } from "../types";
import { renderHeader } from "./headerRenderer";
import { renderClientAndDateInfo } from "./clientInfoRenderer";
import { renderTable } from "./tableRenderer";
import { renderSummary } from "./summaryRenderer";
import { renderPaymentInfo } from "./paymentInfoRenderer";
import { renderNotes } from "./notesRenderer";
import { renderFooter } from "./footerRenderer";
import { MINIMALIST_TEMPLATE_CONFIG } from "../templateConfig";

export const renderMinimalistTemplate = (doc: jsPDF, props: InvoiceTemplateProps): void => {
  const {
    logoPreview,
    invoiceItems,
    invoiceDate,
    dueDate,
    additionalInfo,
    bankName,
    accountNumber,
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
  yPos = renderHeader(doc, logoPreview, invoiceNumber, yPos, colors, margins, pageWidth);
  
  // Add horizontal divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margins.left, yPos + 5, pageWidth - margins.right, yPos + 5);
  yPos += 15;
  
  // Add client and date info in a clean layout
  yPos = renderClientAndDateInfo(doc, clientName, invoiceDate, dueDate, yPos, colors, margins, pageWidth);
  yPos += 15;
  
  // Add invoice items with minimal styling
  yPos = renderTable(doc, invoiceItems, yPos, colors, margins);
  yPos += 15;
  
  // Add totals with right alignment
  yPos = renderSummary(doc, subtotal, tax, total, yPos, colors, margins, pageWidth);
  yPos += 20;
  
  // Add payment details if provided
  if (bankName || accountName || accountNumber) {
    yPos = renderPaymentInfo(doc, bankName, accountName, accountNumber, yPos, colors, margins);
    yPos += 15;
  }
  
  // Add notes if provided
  if (additionalInfo) {
    yPos = renderNotes(doc, additionalInfo, yPos, colors, margins, pageWidth);
  }
  
  // Add minimal footer
  renderFooter(doc, colors, pageWidth);
};
