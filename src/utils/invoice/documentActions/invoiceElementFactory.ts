
import { format } from "date-fns";
import { InvoiceDetails } from "../pdfSections/types";
import { calculateSubtotal, calculateTax, calculateTotal } from "../calculations";

/**
 * Creates a temporary invoice HTML element for rendering to PDF/image
 */
export const createTemporaryInvoiceElement = (invoiceDetails: InvoiceDetails): HTMLElement => {
  const tempDiv = document.createElement('div');
  tempDiv.className = 'invoice-preview-temp';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.padding = '20px';
  tempDiv.style.width = '800px';
  
  // Process the logo for the temporary element
  let logoHtml = '';
  if (invoiceDetails.logoPreview) {
    logoHtml = `<img 
      src="${invoiceDetails.logoPreview}" 
      style="height: 60px; width: auto; object-fit: contain;" 
      crossorigin="anonymous" 
      alt="Company Logo"
    />`;
  }
  
  // Create a simplified invoice layout
  tempDiv.innerHTML = `
    <div style="font-family: Arial, sans-serif;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 24px; margin-bottom: 5px;">INVOICE</h2>
          <p style="font-size: 14px; color: #666;">
            ${invoiceDetails.invoiceNumber ? `<span style="font-weight: 500;">Invoice No:</span> ${invoiceDetails.invoiceNumber}` : ''}
          </p>
          <p style="font-size: 14px; color: #666;">
            <span style="font-weight: 500;">Issue Date:</span> ${invoiceDetails.invoiceDate ? format(invoiceDetails.invoiceDate, "dd MMM yyyy") : ""}
          </p>
          <p style="font-size: 14px; color: #666;">
            <span style="font-weight: 500;">Due Date:</span> ${invoiceDetails.dueDate ? format(invoiceDetails.dueDate, "dd MMM yyyy") : ""}
          </p>
        </div>
        ${logoHtml}
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; margin-bottom: 5px;">Bill To:</h3>
        <p style="font-weight: 500;">${invoiceDetails.clientName || "Client"}</p>
        <p style="color: #666;">${invoiceDetails.clientEmail || "client@example.com"}</p>
        <p style="color: #666;">${invoiceDetails.clientAddress || "Client Address, City"}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">Description</th>
            <th style="text-align: right; padding: 8px;">Qty</th>
            <th style="text-align: right; padding: 8px;">Price</th>
            <th style="text-align: right; padding: 8px;">Tax</th>
            <th style="text-align: right; padding: 8px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceDetails.invoiceItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">${item.description}</td>
              <td style="text-align: right; padding: 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 8px;">₦${item.price.toLocaleString()}</td>
              <td style="text-align: right; padding: 8px;">${item.tax}%</td>
              <td style="text-align: right; padding: 8px;">₦${(item.quantity * item.price).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <div style="width: 200px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span style="color: #666;">Subtotal:</span>
            <span>₦${calculateSubtotal(invoiceDetails.invoiceItems).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span style="color: #666;">Tax:</span>
            <span>₦${calculateTax(invoiceDetails.invoiceItems).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; border-top: 1px solid #ddd; margin-top: 5px;">
            <span>Total:</span>
            <span>₦${calculateTotal(invoiceDetails.invoiceItems).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; margin-bottom: 5px;">Bank Details</h3>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Bank Name:</span> ${invoiceDetails.bankName || ""}</p>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Account Name:</span> ${invoiceDetails.accountName || ""}</p>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Account Number:</span> ${invoiceDetails.accountNumber || ""}</p>
      </div>
      
      ${invoiceDetails.additionalInfo ? `
        <div style="border-top: 1px solid #eee; padding-top: 10px;">
          <h3 style="font-size: 16px; margin-bottom: 5px;">Additional Information</h3>
          <p style="font-size: 14px; color: #666;">${invoiceDetails.additionalInfo}</p>
        </div>
      ` : ""}
    </div>
  `;
  
  return tempDiv;
};
