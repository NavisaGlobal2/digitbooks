
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceDetails } from "../pdfSections/types";
import { createTemporaryInvoiceElement } from "./invoiceElementFactory";
import { calculateSubtotal, calculateTax, calculateTotal } from "../calculations";

/**
 * Function to download the invoice using image capture and PDF conversion
 */
export const downloadInvoice = async (invoiceDetails: InvoiceDetails) => {
  // Prevent multiple generation attempts
  const toastId = toast.loading("Generating PDF...");
  
  try {
    // Process the logo if it exists to avoid CORS issues
    let processedLogo = invoiceDetails.logoPreview;
    
    if (invoiceDetails.logoPreview) {
      try {
        // Create a new Image to properly load the logo with CORS handling
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        // Wait for the image to load before proceeding with a timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log("Logo load timeout, using fallback");
            processedLogo = null;
            resolve(null);
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            console.log("Failed to load logo, using fallback");
            processedLogo = null;
            resolve(null);
          };
          
          img.src = invoiceDetails.logoPreview;
        });
        
        // Only process the image if it loaded successfully
        if (processedLogo) {
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
        }
      } catch (error) {
        console.error("Error preprocessing logo:", error);
        processedLogo = null;
      }
    }
    
    // Create a modified invoice details object with the processed logo
    const modifiedInvoiceDetails = {
      ...invoiceDetails,
      logoPreview: processedLogo
    };
    
    // First try to find an existing preview element
    const previewElement = document.querySelector('.invoice-preview');
    
    if (previewElement) {
      // If a preview element exists, capture it directly
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true, // Enable CORS for images
        allowTaint: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Find all images and ensure they load correctly
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
      const clientName = invoiceDetails.clientName || "Client";
      const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success("Invoice downloaded successfully!", {
        id: toastId
      });
      return true;
    } else {
      // If no preview element exists, create a temporary one
      const tempDiv = createTemporaryInvoiceElement(modifiedInvoiceDetails);
      document.body.appendChild(tempDiv);
      
      try {
        // Wait longer for images to load properly before capturing
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Capture the temporary element
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // Find all images and ensure they load correctly
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
        const clientName = invoiceDetails.clientName || "Client";
        const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
        
        // Save the PDF
        pdf.save(fileName);
        
        toast.success("Invoice downloaded successfully!", {
          id: toastId
        });
        return true;
      } finally {
        // Always remove the temporary element
        document.body.removeChild(tempDiv);
      }
    }
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice. Please try again.", {
      id: toastId
    });
    return false;
  }
};
