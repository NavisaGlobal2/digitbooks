
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceDetails } from "../pdfSections/types";
import { createTemporaryInvoiceElement } from "./invoiceElementFactory";
import { calculateSubtotal, calculateTax, calculateTotal } from "../calculations";
import { saveInvoiceToHistory } from "@/services/invoiceHistoryService";

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
        
        // Set up a promise to handle image loading
        await new Promise((resolve, reject) => {
          // Add timeout to prevent hanging
          const timeout = setTimeout(() => {
            console.warn("Logo load timed out, proceeding without it");
            resolve(null);
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          
          img.onerror = (e) => {
            console.error("Error loading logo:", e);
            clearTimeout(timeout);
            resolve(null); // Resolve anyway to continue without logo
          };
          
          img.src = invoiceDetails.logoPreview;
        });
        
        // Process the image through canvas to handle CORS
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 300;
          canvas.height = img.naturalHeight || 100;
          const ctx = canvas.getContext("2d");
          if (ctx && img.complete && img.naturalHeight > 0) {
            ctx.drawImage(img, 0, 0);
            // Replace the logo with a clean base64 version
            processedLogo = canvas.toDataURL("image/png");
          } else {
            console.warn("Could not process logo through canvas");
            processedLogo = null;
          }
        } catch (canvasError) {
          console.error("Error processing logo with canvas:", canvasError);
          processedLogo = null;
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
    
    // Find an existing preview element
    const previewElement = document.querySelector('.invoice-preview');
    
    // Approach based on whether we have a visible preview
    if (previewElement) {
      console.log("Using visible preview for PDF generation");
      
      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture with better settings
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2, // Higher scale for better quality
        logging: true,
        useCORS: true, // Enable CORS for images
        allowTaint: true,
        backgroundColor: "#ffffff",
        imageTimeout: 2000,
        onclone: (clonedDoc) => {
          // Ensure all images in the clone have crossOrigin set
          const images = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            images[i].crossOrigin = "anonymous";
          }
        }
      });
      
      // Create PDF with proper dimensions based on the captured content
      const imgWidth = 210; // A4 width in mm (standard)
      const pageHeight = 297; // A4 height in mm (standard)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add canvas as image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const dateStr = format(new Date(), "yyyyMMdd");
      const clientName = invoiceDetails.clientName || "Client";
      const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      // Save to history
      await saveInvoiceToHistory({
        type: "invoice",
        clientName: invoiceDetails.clientName,
        date: new Date(),
        fileName,
        amount: calculateTotal(invoiceDetails.invoiceItems),
        invoiceNumber: invoiceDetails.invoiceNumber || dateStr,
        pdfBlob: await pdf.output('blob')
      });
      
      toast.success("Invoice downloaded successfully!", {
        id: toastId
      });
      return true;
    } else {
      console.log("Creating temporary invoice element for PDF generation");
      // Create a temporary element for rendering
      const tempDiv = createTemporaryInvoiceElement(modifiedInvoiceDetails);
      document.body.appendChild(tempDiv);
      
      try {
        // Wait for elements to render and any images to load
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Capture the temporary element
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: true,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          imageTimeout: 2000,
          onclone: (clonedDoc) => {
            // Ensure all images in the clone have crossOrigin set
            const images = clonedDoc.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
              images[i].crossOrigin = "anonymous";
              // Add onError handler for each image
              images[i].onerror = function() {
                console.error("Image failed to load in clone:", this.src);
                this.style.display = 'none';
              };
            }
          }
        });
        
        // Create PDF with proper dimensions based on the captured content
        const imgWidth = 210; // A4 width in mm (standard)
        const pageHeight = 297; // A4 height in mm (standard)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF({
          orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add canvas as image to PDF, ensuring it fits correctly
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Generate filename
        const dateStr = format(new Date(), "yyyyMMdd");
        const clientName = invoiceDetails.clientName || "Client";
        const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
        
        // Save PDF
        pdf.save(fileName);
        
        // Save to history
        await saveInvoiceToHistory({
          type: "invoice",
          clientName: invoiceDetails.clientName,
          date: new Date(),
          fileName,
          amount: calculateTotal(invoiceDetails.invoiceItems),
          invoiceNumber: invoiceDetails.invoiceNumber || dateStr,
          pdfBlob: await pdf.output('blob')
        });
        
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
