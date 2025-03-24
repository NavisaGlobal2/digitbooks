
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { toast } from "sonner";
import { InvoiceDetails, generateInvoice } from "./pdfGenerator";

/**
 * Function to download the invoice
 */
export const downloadInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    const pdfBlob = await generateInvoice(invoiceDetails);
    
    // Generate a filename
    const dateStr = format(new Date(), "yyyyMMdd");
    const fileName = `Invoice-${dateStr}.pdf`;
    
    // Download the file
    saveAs(pdfBlob, fileName);
    
    toast.success("Invoice downloaded successfully!");
    return true;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice. Please try again.");
    return false;
  }
};

/**
 * Function to share the invoice
 */
export const shareInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    // First generate the PDF
    const pdfBlob = await generateInvoice(invoiceDetails);
    
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

