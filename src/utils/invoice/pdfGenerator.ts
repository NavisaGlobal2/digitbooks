
/**
 * Main PDF generator for invoices
 */

import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { calculateSubtotal, calculateTax, calculateTotal } from "./calculations";
import { 
  addLogo, 
  addInvoiceHeader, 
  addDates, 
  addClientInfo, 
  addInvoiceItems, 
  addInvoiceSummary, 
  addPaymentInfo, 
  addAdditionalInfo, 
  addFooter 
} from "./pdfContent";
import { InvoiceDetails } from "./pdfSections/types";

/**
 * Generate a PDF invoice with improved formatting
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
    invoiceNumber = format(new Date(), "yyyyMMdd")
  } = invoiceDetails;

  // Create a new PDF document with A4 size and higher quality settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    precision: 4
  });
  
  // Add document metadata for better PDF properties
  doc.setProperties({
    title: `Invoice ${invoiceNumber}`,
    subject: 'Invoice Document',
    author: 'DigitBooks',
    keywords: 'invoice, billing, payment',
    creator: 'DigitBooks Invoice Generator'
  });
  
  // Set default font for better rendering
  doc.setFont('helvetica');
  
  // Start position for content with proper margins
  let yPos = 20;
  
  // Add logo with improved positioning
  yPos = addLogo(doc, logoPreview, yPos);
  
  // Add invoice header and number with better spacing
  yPos = addInvoiceHeader(doc, invoiceNumber, yPos);
  
  // Add dates with consistent formatting
  yPos = addDates(doc, invoiceDate, dueDate, yPos);
  
  // Add client info with proper layout
  yPos = addClientInfo(doc, clientName, yPos);
  
  // Add invoice items table with improved formatting
  yPos = addInvoiceItems(doc, invoiceItems, yPos);
  
  // Calculate totals
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);
  
  // Add invoice summary with clear layout
  yPos = addInvoiceSummary(doc, subtotal, tax, total, yPos);
  
  // Add payment information with proper spacing
  yPos = addPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos);
  
  // Add additional information with better formatting
  yPos = addAdditionalInfo(doc, additionalInfo, yPos);
  
  // Add footer with consistent positioning
  addFooter(doc);
  
  // Ensure text is rendered at high quality
  doc.setFontSize(10);
  
  // Convert the PDF to a Blob - fixed to use the correct output format
  // The error was caused by using 'blob' which is not a valid output type
  // Instead, we get the arrayBuffer and create a Blob from it
  const arrayBuffer = doc.output('arraybuffer');
  const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
  
  return pdfBlob;
};
