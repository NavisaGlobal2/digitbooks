
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { toast } from "sonner";
import { generateInvoice } from "./pdfGenerator";
import { InvoiceDetails } from "./pdfSections/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Function to download the invoice using image capture and PDF conversion
 */
export const downloadInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    toast.loading("Generating PDF...");
    
    // First try to find an existing preview element
    const previewElement = document.querySelector('.invoice-preview');
    
    if (previewElement) {
      // If a preview element exists, capture it directly
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true, // Enable CORS for images
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      // Add the image to the PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Generate a filename
      const dateStr = format(new Date(), "yyyyMMdd");
      const clientName = invoiceDetails.clientName || "Client";
      const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success("Invoice downloaded successfully!");
      return true;
    } else {
      // If no preview element exists, create a temporary one
      const tempDiv = document.createElement('div');
      tempDiv.className = 'invoice-preview';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px';
      tempDiv.style.width = '800px';
      
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
            ${invoiceDetails.logoPreview ? `<img src="${invoiceDetails.logoPreview}" style="height: 60px; object-fit: contain;" />` : ''}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 5px;">Bill To:</h3>
            <p style="font-weight: 500;">${invoiceDetails.clientName || "Client"}</p>
            <p style="color: #666;">client@example.com</p>
            <p style="color: #666;">Client Address, City</p>
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
      
      document.body.appendChild(tempDiv);
      
      try {
        // Capture the temporary element
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff"
        });
        
        // Create a new PDF document
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Generate a filename
        const dateStr = format(new Date(), "yyyyMMdd");
        const clientName = invoiceDetails.clientName || "Client";
        const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
        
        // Save the PDF
        pdf.save(fileName);
        
        toast.success("Invoice downloaded successfully!");
        return true;
      } finally {
        // Always remove the temporary element
        document.body.removeChild(tempDiv);
      }
    }
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice. Please try again.");
    return false;
  }
};

// Helper functions for calculations
const calculateSubtotal = (items: { quantity: number; price: number }[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
};

const calculateTax = (items: { quantity: number; price: number; tax: number }[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.price * (item.tax / 100)), 0);
};

const calculateTotal = (items: { quantity: number; price: number; tax: number }[]) => {
  return calculateSubtotal(items) + calculateTax(items);
};

/**
 * Function to capture and download the invoice as an image
 */
export const captureInvoiceAsImage = async (element: HTMLElement, clientName: string = "Client") => {
  try {
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true, // Enable CORS for images
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    
    // Convert the canvas to a blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/png', 1.0);
    });
    
    // Generate filename
    const dateStr = format(new Date(), "yyyyMMdd");
    const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.png`;
    
    // Download the file
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error("Error capturing invoice:", error);
    toast.error("Failed to capture invoice. Please try again.");
    return false;
  }
};

/**
 * Function to share the invoice
 */
export const shareInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    toast.loading("Preparing invoice for sharing...");
    
    // First try to find an existing preview element
    const previewElement = document.querySelector('.invoice-preview');
    
    let canvas;
    
    if (previewElement) {
      // If a preview element exists, capture it directly
      canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
    } else {
      // If no preview element exists, create a temporary one using the same template as in downloadInvoice
      const tempDiv = document.createElement('div');
      tempDiv.className = 'invoice-preview-temp';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px';
      tempDiv.style.width = '800px';
      
      // Create a simplified invoice layout (same as in downloadInvoice)
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
            ${invoiceDetails.logoPreview ? `<img src="${invoiceDetails.logoPreview}" style="height: 60px; object-fit: contain;" />` : ''}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 5px;">Bill To:</h3>
            <p style="font-weight: 500;">${invoiceDetails.clientName || "Client"}</p>
            <p style="color: #666;">client@example.com</p>
            <p style="color: #666;">Client Address, City</p>
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
      
      document.body.appendChild(tempDiv);
      
      try {
        canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff"
        });
      } finally {
        document.body.removeChild(tempDiv);
      }
    }
    
    // Convert the canvas to a blob
    const imgBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/png', 1.0);
    });
    
    // Create a PDF from the image
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    
    // Convert the PDF to a blob
    const pdfBlob = pdf.output('blob');
    
    // Check if the Web Share API is available
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], "invoice.pdf", { type: "application/pdf" });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: 'Please find attached invoice.',
        });
        toast.success("Share dialog opened successfully!");
        return true;
      }
    }
    
    // Fallback for browsers that don't support file sharing
    // Create a temporary URL and copy to clipboard
    const dataUrl = URL.createObjectURL(pdfBlob);
    
    try {
      // Create a temporary link to download
      const tempLink = document.createElement('a');
      tempLink.href = dataUrl;
      tempLink.setAttribute('download', 'invoice.pdf');
      tempLink.click();
      
      toast.success("Invoice ready to share!");
      return true;
    } finally {
      // Clean up
      URL.revokeObjectURL(dataUrl);
    }
  } catch (error) {
    console.error("Error sharing invoice:", error);
    toast.error("Failed to share invoice. Please try again.");
    return false;
  }
};
