
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { createReceiptElement } from "./receiptElementFactory";

/**
 * Function to download the receipt for a paid invoice
 */
export const downloadReceipt = async (invoice: Invoice) => {
  if (invoice.status !== 'paid' && invoice.status !== 'partially-paid') {
    toast.error("Only paid or partially paid invoices can be downloaded as receipts");
    return false;
  }

  // Prevent multiple generation attempts
  const toastId = toast.loading("Generating receipt...");
  
  try {
    // Create a temporary receipt element
    const tempDiv = createReceiptElement(invoice);
    document.body.appendChild(tempDiv);
    
    // Wait a short time to ensure any images load
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
      const clientName = invoice.clientName || "Client";
      const fileName = `Receipt-${clientName.replace(/\s+/g, '_').toLowerCase()}-${dateStr}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success("Receipt downloaded successfully!", {
        id: toastId
      });
      return true;
    } finally {
      // Always remove the temporary element
      document.body.removeChild(tempDiv);
    }
  } catch (error) {
    console.error("Error downloading receipt:", error);
    toast.error("Failed to download receipt. Please try again.", {
      id: toastId
    });
    return false;
  }
};
