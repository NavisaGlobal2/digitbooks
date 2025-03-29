
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";

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
