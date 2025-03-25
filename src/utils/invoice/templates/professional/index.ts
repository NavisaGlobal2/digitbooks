
/**
 * Professional template entry point that composes all components
 */
import jsPDF from "jspdf";
import { InvoiceTemplateProps } from "../types";
import { PROFESSIONAL_TEMPLATE_CONFIG } from "../templateConfig";
import { renderHeader } from "./headerRenderer";
import { renderBillingInfo } from "./billingInfoRenderer";
import { renderItemsTable } from "./itemsTableRenderer";
import { renderSummary } from "./summaryRenderer";
import { renderPaymentInfo } from "./paymentInfoRenderer";
import { renderAdditionalInfo } from "./additionalInfoRenderer";
import { renderFooter } from "./footerRenderer";

/**
 * Professional invoice template with business-focused design
 * This is the main export that composes all parts of the template
 */
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
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Render each section of the invoice
  renderHeader(doc, logoPreview, invoiceNumber, config);
  
  // Start position for content after header
  let yPos = 50;
  
  // Billing and date information with two-column layout
  yPos = renderBillingInfo(doc, clientName, invoiceDate, dueDate, yPos, config, pageWidth);
  
  // Invoice items table
  yPos = renderItemsTable(doc, invoiceItems, yPos + 10, config.margins);
  
  // Invoice summary on the right
  yPos = renderSummary(doc, subtotal, tax, total, yPos + 10, config.colors, config.margins, pageWidth);
  
  // Payment information in highlighted box
  if (bankName || accountName || accountNumber) {
    yPos = renderPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos + 10, config.colors, config.margins, pageWidth);
  }
  
  // Additional information in light container
  if (additionalInfo) {
    yPos = renderAdditionalInfo(doc, additionalInfo, yPos + 10, config.colors, config.margins, pageWidth);
  }
  
  // Footer
  renderFooter(doc, config.colors, pageWidth, pageHeight);
};
