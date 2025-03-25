
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
    // Find the invoice preview element
    const previewElement = document.querySelector('.invoice-preview');
    if (!previewElement) {
      throw new Error("Invoice preview not found");
    }
    
    toast.loading("Generating PDF...");
    
    // First capture the invoice as an image
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
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice. Please try again.");
    return false;
  }
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
    // Find the invoice preview element
    const previewElement = document.querySelector('.invoice-preview');
    if (!previewElement) {
      throw new Error("Invoice preview not found");
    }
    
    // First capture the invoice as an image
    const canvas = await html2canvas(previewElement as HTMLElement, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });
    
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
