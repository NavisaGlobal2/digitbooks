
import { format } from "date-fns";
import { InvoiceDetails } from "../pdfSections/types";
import { formatNaira } from "../formatters";
import { calculateSubtotal, calculateTax, calculateTotal } from "../calculations";

/**
 * Creates a temporary DOM element for invoice rendering
 */
export const createTemporaryInvoiceElement = (invoiceDetails: InvoiceDetails): HTMLElement => {
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
    invoiceNumber = "INV-" + format(new Date(), "yyyyMMdd"),
    selectedTemplate = "default"
  } = invoiceDetails;

  const dateFormat = "dd MMM yyyy";
  const issuedDateStr = invoiceDate ? format(invoiceDate, dateFormat) : format(new Date(), dateFormat);
  const dueDateStr = dueDate ? format(dueDate, dateFormat) : "Not set";

  // Calculate invoice totals
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);

  // Create a temporary div to hold the invoice
  const tempDiv = document.createElement('div');
  tempDiv.className = 'invoice-preview bg-white p-8';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '40px';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.color = '#333';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  
  // Add template-specific styling
  let templateClass = '';
  switch (selectedTemplate) {
    case 'professional':
      templateClass = 'professional-template';
      tempDiv.style.fontFamily = 'Georgia, serif';
      break;
    case 'minimalist':
      templateClass = 'minimalist-template';
      tempDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';
      break;
    default:
      templateClass = 'default-template';
      break;
  }
  tempDiv.classList.add(templateClass);

  // Build the invoice HTML structure
  tempDiv.innerHTML = `
    <div class="invoice-header" style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">INVOICE</h1>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Invoice No:</strong> ${invoiceNumber}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Issue Date:</strong> ${issuedDateStr}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Due Date:</strong> ${dueDateStr}</p>
      </div>
      ${logoPreview ? `<div><img src="${logoPreview}" alt="Business Logo" style="max-height: 80px; max-width: 200px;"></div>` : ''}
    </div>
    
    <div class="client-info" style="margin-bottom: 30px;">
      <h2 style="font-size: 16px; margin: 0 0 10px 0;">Bill To:</h2>
      <p style="margin: 0; font-weight: bold;">${clientName}</p>
      ${clientAddress ? `<p style="margin: 5px 0;">${clientAddress}</p>` : ''}
      ${clientEmail ? `<p style="margin: 5px 0;">${clientEmail}</p>` : ''}
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f4f4f4;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Tax (%)</th>
          <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoiceItems.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${formatNaira(item.price)}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.tax}%</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${formatNaira(item.quantity * item.price)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
      <div style="width: 250px;">
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Subtotal:</span>
          <span>${formatNaira(subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
          <span>Tax:</span>
          <span>${formatNaira(tax)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; border-top: 1px solid #ddd; margin-top: 5px;">
          <span>Total:</span>
          <span>${formatNaira(total)}</span>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; margin: 0 0 10px 0;">Bank Details</h2>
      <p style="margin: 5px 0;"><strong>Bank Name:</strong> ${bankName}</p>
      <p style="margin: 5px 0;"><strong>Account Name:</strong> ${accountName}</p>
      <p style="margin: 5px 0;"><strong>Account Number:</strong> ${accountNumber}</p>
    </div>
    
    ${additionalInfo ? `
      <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
        <h2 style="font-size: 16px; margin: 0 0 10px 0;">Additional Information</h2>
        <p style="margin: 0;">${additionalInfo}</p>
      </div>
    ` : ''}
    
    <div style="margin-top: 40px; text-align: center; color: #777; font-size: 12px;">
      <p>Thank you for your business!</p>
    </div>
  `;

  return tempDiv;
};
