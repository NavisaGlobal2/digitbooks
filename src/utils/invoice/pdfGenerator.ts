
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
 * Generate a PDF invoice
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

  // Create a new PDF document with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Start position for content
  let yPos = 20;
  
  // Add logo
  yPos = addLogo(doc, logoPreview, yPos);
  
  // Add invoice header and number
  yPos = addInvoiceHeader(doc, invoiceNumber, yPos);
  
  // Add dates
  yPos = addDates(doc, invoiceDate, dueDate, yPos);
  
  // Add client info
  yPos = addClientInfo(doc, clientName, yPos);
  
  // Add invoice items table
  yPos = addInvoiceItems(doc, invoiceItems, yPos);
  
  // Calculate totals
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);
  
  // Add invoice summary
  yPos = addInvoiceSummary(doc, subtotal, tax, total, yPos);
  
  // Add payment information
  yPos = addPaymentInfo(doc, bankName, accountName, accountNumber, swiftCode, yPos);
  
  // Add additional information
  yPos = addAdditionalInfo(doc, additionalInfo, yPos);
  
  // Add footer
  addFooter(doc);
  
  // Convert the PDF to a Blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
