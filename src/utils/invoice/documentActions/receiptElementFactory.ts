
import { format } from "date-fns";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { calculateSubtotal, calculateTax, calculateTotal } from "../calculations";

/**
 * Creates a temporary receipt HTML element for rendering to PDF/image
 */
export const createReceiptElement = (invoice: Invoice): HTMLDivElement => {
  const tempDiv = document.createElement('div');
  tempDiv.className = 'invoice-preview-temp receipt-preview';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.padding = '20px';
  tempDiv.style.width = '800px';
  
  // Add template class for CSS styling
  tempDiv.classList.add(`template-${invoice.logoUrl ? 'default' : 'default'}`);
  
  // Process the logo for the temporary element
  let logoHtml = '';
  if (invoice.logoUrl) {
    logoHtml = `<img 
      src="${invoice.logoUrl}" 
      style="height: 60px; width: auto; object-fit: contain;" 
      crossorigin="anonymous" 
      alt="Company Logo"
    />`;
  }
  
  // Calculate payment totals
  const totalPaid = invoice.payments ? 
    invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 
    invoice.amount;
  
  const paidDate = invoice.paidDate ? 
    format(invoice.paidDate, "dd MMM yyyy") : 
    format(new Date(), "dd MMM yyyy");
  
  // Create a receipt layout
  tempDiv.innerHTML = `
    <div style="font-family: Arial, sans-serif;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center;">
        <div>
          <h2 style="font-size: 24px; margin-bottom: 5px; color: #15803d;">RECEIPT</h2>
          <p style="font-size: 14px; color: #666;">
            ${invoice.invoiceNumber ? `<span style="font-weight: 500;">Original Invoice No:</span> ${invoice.invoiceNumber}` : ''}
          </p>
          <p style="font-size: 14px; color: #666;">
            <span style="font-weight: 500;">Receipt Date:</span> ${paidDate}
          </p>
        </div>
        ${logoHtml}
      </div>
      
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
        <p style="font-size: 14px; margin-bottom: 5px; color: #666;"><span style="font-weight: 500;">Billed To:</span></p>
        <p style="font-weight: 500; margin: 0;">${invoice.clientName || "Client"}</p>
        ${invoice.clientEmail ? `<p style="color: #666; margin: 0;">${invoice.clientEmail}</p>` : ''}
        ${invoice.clientAddress ? `<p style="color: #666; margin: 0;">${invoice.clientAddress}</p>` : ''}
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd; background-color: #f3f4f6;">
            <th style="text-align: left; padding: 12px 8px;">Description</th>
            <th style="text-align: right; padding: 12px 8px;">Qty</th>
            <th style="text-align: right; padding: 12px 8px;">Price</th>
            <th style="text-align: right; padding: 12px 8px;">Tax</th>
            <th style="text-align: right; padding: 12px 8px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 8px;">${item.description}</td>
              <td style="text-align: right; padding: 10px 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 10px 8px;">₦${item.price.toLocaleString()}</td>
              <td style="text-align: right; padding: 10px 8px;">${item.tax}%</td>
              <td style="text-align: right; padding: 10px 8px;">₦${(item.quantity * item.price).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 48%;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #15803d; border-bottom: 1px solid #15803d; padding-bottom: 5px;">Payment Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: left; padding: 8px;">Date</th>
                <th style="text-align: left; padding: 8px;">Method</th>
                <th style="text-align: right; padding: 8px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.payments ? invoice.payments.map(payment => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${format(new Date(payment.date), "dd MMM yyyy")}</td>
                  <td style="padding: 8px; text-transform: capitalize;">${payment.method}</td>
                  <td style="text-align: right; padding: 8px;">₦${payment.amount.toLocaleString()}</td>
                </tr>
              `).join('') : `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${paidDate}</td>
                  <td style="padding: 8px;">Full Payment</td>
                  <td style="text-align: right; padding: 8px;">₦${invoice.amount.toLocaleString()}</td>
                </tr>
              `}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #ddd; font-weight: bold;">
                <td style="padding: 8px;" colspan="2">Total Paid</td>
                <td style="text-align: right; padding: 8px;">₦${totalPaid.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="width: 48%;">
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="color: #666;">Subtotal:</span>
              <span>₦${calculateSubtotal(invoice.items).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="color: #666;">Tax:</span>
              <span>₦${calculateTax(invoice.items).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; border-top: 1px solid #ddd; margin-top: 5px;">
              <span>Total:</span>
              <span>₦${calculateTotal(invoice.items).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #15803d; font-weight: bold; border-top: 1px solid #ddd; margin-top: 5px;">
              <span>PAID IN FULL</span>
              <span>${paidDate}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <h3 style="font-size: 16px; margin-bottom: 5px;">Bank Details</h3>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Bank Name:</span> ${invoice.bankDetails.bankName || ""}</p>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Account Name:</span> ${invoice.bankDetails.accountName || ""}</p>
        <p style="font-size: 14px;"><span style="font-weight: 500;">Account Number:</span> ${invoice.bankDetails.accountNumber || ""}</p>
      </div>
      
      ${invoice.additionalInfo ? `
        <div style="border-top: 1px solid #eee; padding-top: 10px;">
          <h3 style="font-size: 16px; margin-bottom: 5px;">Additional Information</h3>
          <p style="font-size: 14px; color: #666;">${invoice.additionalInfo}</p>
        </div>
      ` : ""}

      <div style="text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #15803d; font-weight: bold;">Thank you for your payment!</p>
        <p style="font-size: 12px; color: #666;">This receipt serves as confirmation of payment received.</p>
      </div>
    </div>
  `;
  
  return tempDiv;
};
