
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceDetails } from "../pdfSections/types";
import { createTemporaryInvoiceElement } from "./invoiceElementFactory";

/**
 * Function to share the invoice
 */
export const shareInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    toast.loading("Preparing invoice for sharing...");
    
    // Ensure invoiceItems is always an array and other properties have defaults
    const sanitizedDetails = {
      ...invoiceDetails,
      invoiceItems: invoiceDetails.invoiceItems || [],
      clientName: invoiceDetails.clientName || "Client",
      additionalInfo: invoiceDetails.additionalInfo || "",
      bankName: invoiceDetails.bankName || "",
      accountName: invoiceDetails.accountName || "",
      accountNumber: invoiceDetails.accountNumber || ""
    };
    
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
      const tempDiv = createTemporaryInvoiceElement(sanitizedDetails);
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
