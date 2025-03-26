
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceDetails } from "../pdfSections/types";
import { createTemporaryInvoiceElement } from "./invoiceElementFactory";
import { calculateSubtotal, calculateTax, calculateTotal } from "./types";

/**
 * Function to download the invoice using image capture and PDF conversion
 */
export const downloadInvoice = async (invoiceDetails: InvoiceDetails) => {
  try {
    toast.loading("Generating PDF...");
    
    // First try to find an existing preview element
    const previewElement = document.querySelector('.invoice-preview');
    
    if (previewElement) {
      // If a preview element exists, capture it directly
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
    } else {
      // If no preview element exists, create a temporary one
      const tempDiv = createTemporaryInvoiceElement(invoiceDetails);
      document.body.appendChild(tempDiv);
      
      try {
        // Capture the temporary element
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          logging: false,
          useCORS: true,
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
      } finally {
        // Always remove the temporary element
        document.body.removeChild(tempDiv);
      }
    }
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice. Please try again.");
    return false;
  }
};
