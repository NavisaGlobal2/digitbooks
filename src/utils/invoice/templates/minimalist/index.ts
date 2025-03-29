
/**
 * Minimalist template with clean, simple design
 */
import jsPDF from "jspdf";
import { format } from "date-fns";
import { InvoiceTemplateProps } from "../types";
import { formatNaira } from "../../formatters";
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
    clientEmail,
    clientAddress,
    invoiceNumber,
    subtotal,
    tax,
    total
  } = props;

  // Get the template configuration
  const config = MINIMALIST_TEMPLATE_CONFIG;
  const { colors, margins } = config;
  
  // Document dimensions
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - margins.left - margins.right;
  
  // Set initial position
  let yPos = margins.top;
  
  // Document header - clean and minimal
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE", margins.left, yPos);
  
  // Add invoice number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(`№ ${invoiceNumber || "Draft"}`, margins.left, yPos + 8);
  
  // Add logo if available - right aligned
  if (logoPreview) {
    try {
      const logoWidth = 40;
      const logoHeight = 20;
      const logoX = pageWidth - margins.right - logoWidth;
      doc.addImage(logoPreview, 'JPEG', logoX, yPos - 10, logoWidth, logoHeight);
    } catch (error) {
      console.error("Error adding logo in minimalist template:", error);
    }
  }
  
  yPos += 20;
  
  // Subtle divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margins.left, yPos, pageWidth - margins.right, yPos);
  
  yPos += 15;
  
  // Client and date information in a two-column layout
  doc.setFontSize(9);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  // Client column - left
  doc.setFont('helvetica', 'bold');
  doc.text("CLIENT", margins.left, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text(clientName, margins.left, yPos + 10);
  
  let clientYPos = yPos + 10;
  if (clientAddress) {
    doc.setFontSize(8);
    doc.text(clientAddress, margins.left, clientYPos + 7);
    clientYPos += 7;
  }
  
  if (clientEmail) {
    doc.setFontSize(8);
    doc.text(clientEmail, margins.left, clientYPos + 7);
  }
  
  // Date column - right
  const dateColX = pageWidth / 2;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("DATE INFORMATION", dateColX, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text("Issue Date:", dateColX, yPos + 10);
  doc.text("Due Date:", dateColX, yPos + 17);
  
  const dateValuesX = dateColX + 50;
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "—", dateValuesX, yPos + 10);
  doc.text(dueDate ? format(dueDate, "dd MMM yyyy") : "—", dateValuesX, yPos + 17);
  
  yPos += 35;
  
  // Items table - minimalist style
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("ITEMS", margins.left, yPos);
  
  yPos += 5;
  
  // Subtle header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margins.left, yPos + 3, pageWidth - margins.right, yPos + 3);
  
  // Table headers
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("Description", margins.left, yPos);
  doc.text("Qty", margins.left + 120, yPos, { align: 'right' });
  doc.text("Unit Price", margins.left + 160, yPos, { align: 'right' });
  doc.text("Tax", margins.left + 190, yPos, { align: 'right' });
  doc.text("Amount", pageWidth - margins.right, yPos, { align: 'right' });
  
  // Table rows
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  
  invoiceItems.forEach((item, index) => {
    yPos += 8;
    doc.text(item.description, margins.left, yPos);
    doc.text(item.quantity.toString(), margins.left + 120, yPos, { align: 'right' });
    doc.text(formatNaira(item.price), margins.left + 160, yPos, { align: 'right' });
    doc.text(`${item.tax}%`, margins.left + 190, yPos, { align: 'right' });
    doc.text(formatNaira(item.quantity * item.price), pageWidth - margins.right, yPos, { align: 'right' });
  });
  
  // Subtotal and total section
  yPos += 15;
  const summaryX = pageWidth - margins.right - 80;
  const valueX = pageWidth - margins.right;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("Subtotal:", summaryX, yPos);
  doc.text(formatNaira(subtotal), valueX, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text("Tax:", summaryX, yPos);
  doc.text(formatNaira(tax), valueX, yPos, { align: 'right' });
  
  // Total with subtle top border
  yPos += 3;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(summaryX - 10, yPos, valueX, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("Total:", summaryX, yPos);
  doc.text(formatNaira(total), valueX, yPos, { align: 'right' });
  
  // Payment information - minimal style
  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("PAYMENT DETAILS", margins.left, yPos);
  
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Bank details in a clean format
  if (bankName) {
    doc.text(`Bank: ${bankName}`, margins.left, yPos);
    yPos += 7;
  }
  
  if (accountName) {
    doc.text(`Account Name: ${accountName}`, margins.left, yPos);
    yPos += 7;
  }
  
  if (accountNumber) {
    doc.text(`Account Number: ${accountNumber}`, margins.left, yPos);
    yPos += 7;
  }
  
  // Additional information
  if (additionalInfo) {
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("NOTES", margins.left, yPos);
    
    yPos += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Split text into lines to fit width
    const textLines = doc.splitTextToSize(additionalInfo, pageWidth - margins.left - margins.right);
    doc.text(textLines, margins.left, yPos);
  }
  
  // Simple footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for your business", pageWidth / 2, pageHeight - 10, { align: 'center' });
};
