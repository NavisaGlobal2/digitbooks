
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
    accountName,
    clientName = "Client",
    clientEmail,
    clientAddress,
    invoiceNumber = format(new Date(), "yyyyMMdd"),
    selectedTemplate = "default"
  } = invoiceDetails;

  // Create a new PDF document with A4 size and improved precision
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    precision: 4
  });
  
  // Add document metadata for better organization
  doc.setProperties({
    title: `Invoice ${invoiceNumber} - ${clientName}`,
    subject: 'Invoice Document',
    author: 'DigitBooks',
    keywords: 'invoice, billing, payment',
    creator: 'DigitBooks Invoice Generator'
  });
  
  // Calculate financial totals
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);
  
  // Apply document-wide font setting for consistency
  doc.setFont('helvetica');
  
  // Process the logo if available
  let processedLogo = logoPreview;
  if (logoPreview && typeof logoPreview === 'string') {
    try {
      // Create a new Image element to properly handle the logo
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoPreview;
      });
      
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the image to the canvas
        ctx.drawImage(img, 0, 0);
        // Get the processed image data
        processedLogo = canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.error("Error processing logo:", error);
      processedLogo = null;
    }
  }
  
  // Render the selected template with improved spacing
  renderInvoiceTemplate(doc, {
    ...invoiceDetails,
    logoPreview: processedLogo,
    subtotal,
    tax,
    total,
    clientEmail,
    clientAddress,
    selectedTemplate
  });
  
  // Convert the PDF to a Blob with proper content type
  const arrayBuffer = doc.output('arraybuffer');
  const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
  
  return pdfBlob;
};
