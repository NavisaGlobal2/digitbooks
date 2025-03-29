
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceDetails } from "../pdfSections/types";
import { createTemporaryInvoiceElement } from "./invoiceElementFactory";

/**
 * Function to share the invoice via web share API or fallback to download
 */
export const shareInvoice = async (invoiceDetails: InvoiceDetails) => {
  const toastId = toast.loading("Preparing invoice for sharing...");
  
  try {
    // Check if Web Share API is supported
    if (!navigator.share) {
      toast.error("Sharing is not supported on this device/browser.", {
        id: toastId
      });
      return false;
    }
    
    // Use the existing preview element or create a temporary one
    const previewElement = document.querySelector('.invoice-preview');
    let tempDiv: HTMLDivElement | null = null;
    let elementToCapture: HTMLElement;
    
    if (previewElement) {
      elementToCapture = previewElement as HTMLElement;
    } else {
      tempDiv = createTemporaryInvoiceElement(invoiceDetails);
      document.body.appendChild(tempDiv);
      elementToCapture = tempDiv;
    }
    
    try {
      // Capture the element as a canvas
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      // Create a PDF from the canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Convert the PDF to a Blob
      const pdfBlob = pdf.output('blob');
      
      // Generate a filename
      const dateStr = format(new Date(), "yyyyMMdd");
      const clientName = invoiceDetails.clientName || "Client";
      const fileName = `Invoice-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Create a File object from the Blob
      const fileToShare = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Share the file
      await navigator.share({
        files: [fileToShare],
        title: 'Invoice',
        text: `Invoice for ${clientName}`
      });
      
      toast.success("Invoice shared successfully!", {
        id: toastId
      });
      return true;
    } finally {
      // Clean up the temporary element if it was created
      if (tempDiv) {
        document.body.removeChild(tempDiv);
      }
    }
  } catch (error) {
    console.error("Error sharing invoice:", error);
    // Web Share API can throw if user cancels - don't show error in this case
    if ((error as Error).name !== 'AbortError') {
      toast.error("Failed to share invoice. Please try again.", {
        id: toastId
      });
    } else {
      // Just dismiss the loading toast if user cancelled
      toast.dismiss(toastId);
    }
    return false;
  }
};
