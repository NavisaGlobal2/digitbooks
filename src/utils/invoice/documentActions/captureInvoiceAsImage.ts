
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";

/**
 * Function to capture the invoice as an image and download it
 */
export const captureInvoiceAsImage = async (element: HTMLElement, clientName: string) => {
  const toastId = toast.loading("Capturing invoice as image...");
  
  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    
    // Convert the canvas to a downloadable link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    // Generate a filename
    const dateStr = format(new Date(), "yyyyMMdd");
    const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.png`;
    
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded successfully!", {
      id: toastId
    });
    return true;
  } catch (error) {
    console.error("Error capturing invoice as image:", error);
    toast.error("Failed to capture invoice as image. Please try again.", {
      id: toastId
    });
    return false;
  }
};
