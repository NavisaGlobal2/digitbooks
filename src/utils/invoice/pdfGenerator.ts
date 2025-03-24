
/**
 * Main PDF generator for invoices with enhanced design and layout
 */

import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { calculateSubtotal, calculateTax, calculateTotal } from "./calculations";
import { InvoiceDetails } from "./pdfSections/types";
import { renderInvoiceTemplate } from "./templates/templateRenderer";

/**
 * Generate a PDF invoice with professional design and layout
 */
export const generateInvoice = async (invoiceDetails: InvoiceDetails): Promise<Blob> => {
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
    clientName = "Client",
    invoiceNumber = format(new Date(), "yyyyMMdd"),
    selectedTemplate = "default"
  } = invoiceDetails;

  // Create a new PDF document with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    precision: 4
  });
  
  // Add document metadata
  doc.setProperties({
    title: `Invoice ${invoiceNumber}`,
    subject: 'Invoice Document',
    author: 'DigitBooks',
    keywords: 'invoice, billing, payment',
    creator: 'DigitBooks Invoice Generator'
  });
  
  // Calculate financial totals
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);
  
  // Render the selected template
  renderInvoiceTemplate(doc, {
    ...invoiceDetails,
    subtotal,
    tax,
    total
  });
  
  // Convert the PDF to a Blob
  const arrayBuffer = doc.output('arraybuffer');
  const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
  
  return pdfBlob;
};
