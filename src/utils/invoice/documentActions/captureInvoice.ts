
import html2canvas from "html2canvas";
import { toast } from "sonner";

/**
 * Captures the invoice as an image (PNG format)
 */
export const captureInvoiceAsImage = async (
  invoiceElement: HTMLElement, 
  clientName: string
): Promise<boolean> => {
  try {
    toast.loading("Capturing invoice as image...");
    
    // Use html2canvas to capture the invoice element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true, // Enable CORS for images
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    
    // Convert canvas to a blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/png', 1.0);
    });
    
    // Create a filename
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `Invoice-${safeName}-${dateStr}.png`;
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    toast.success("Invoice captured as image!");
    return true;
  } catch (error) {
    console.error("Error capturing invoice as image:", error);
    toast.error("Failed to capture invoice as image");
    return false;
  }
};
