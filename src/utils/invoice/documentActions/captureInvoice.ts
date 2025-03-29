
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

/**
 * Capture an invoice as an image and download it
 */
export const captureInvoiceAsImage = async (invoiceElement: HTMLElement, clientName: string = "Client") => {
  const toastId = toast.loading("Capturing invoice image...");
  
  try {
    // Capture the element as an image
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Generate a filename
        const dateStr = format(new Date(), "yyyyMMdd");
        const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.png`;
        
        // Save the image
        saveAs(blob, fileName);
        
        toast.success("Invoice image downloaded successfully!", {
          id: toastId
        });
      } else {
        toast.error("Failed to create image. Please try again.", {
          id: toastId
        });
      }
    }, "image/png", 1.0);
    
    return true;
  } catch (error) {
    console.error("Error capturing invoice as image:", error);
    toast.error("Failed to capture invoice. Please try again.", {
      id: toastId
    });
    return false;
  }
};
