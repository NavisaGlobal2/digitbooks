
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { createReceiptElement } from "./receiptElementFactory";

/**
 * Function to download the receipt for a paid invoice
 */
export const downloadReceipt = async (invoice: Invoice) => {
  if (invoice.status !== 'paid' && invoice.status !== 'partially-paid') {
    toast.error("Only paid or partially paid invoices can be downloaded as receipts");
    return false;
  }

  // Prevent multiple generation attempts
  const toastId = toast.loading("Generating receipt...");
  
  try {
    // First, process the logo if it exists to avoid CORS issues
    let processedLogo = invoice.logoUrl;
    if (invoice.logoUrl && typeof invoice.logoUrl === 'string') {
      try {
        // Create a new Image to properly load the logo with CORS handling
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        // Wait for the image to load before proceeding
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Logo load timeout")), 3000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load logo"));
          };
          img.src = invoice.logoUrl;
        });
        
        // Update the invoice details with the properly loaded image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Replace the logo with a clean base64 version
          processedLogo = canvas.toDataURL("image/png");
        }
      } catch (error) {
        console.error("Error preprocessing logo:", error);
        processedLogo = null;
      }
    }
    
    // Create a modified invoice with the processed logo
    const modifiedInvoice = {
      ...invoice,
      logoUrl: processedLogo
    };
    
    // Create a temporary receipt element
    const tempDiv = createReceiptElement(modifiedInvoice);
    document.body.appendChild(tempDiv);
    
    // Wait a bit longer to ensure any images load properly
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      // Capture the temporary element with better settings
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Find all images and make sure they load
          const images = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            img.crossOrigin = "anonymous";
          }
        }
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
      const clientName = invoice.clientName || "Client";
      const fileName = `Receipt-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success("Receipt downloaded successfully!", {
        id: toastId
      });
      return true;
    } finally {
      // Always remove the temporary element
      document.body.removeChild(tempDiv);
    }
  } catch (error) {
    console.error("Error downloading receipt:", error);
    toast.error("Failed to download receipt. Please try again.", {
      id: toastId
    });
    return false;
  }
};
