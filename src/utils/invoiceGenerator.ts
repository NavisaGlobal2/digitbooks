
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { toast } from "sonner";

// Define types for invoice data
interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface InvoiceDetails {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  accountName: string;
  businessName?: string;
  businessEmail?: string;
  businessAddress?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
}

// Function to format currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate totals
const calculateSubtotal = (invoiceItems: InvoiceItem[]) => {
  return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};

const calculateTax = (invoiceItems: InvoiceItem[]) => {
  return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0);
};

const calculateTotal = (invoiceItems: InvoiceItem[]) => {
  return calculateSubtotal(invoiceItems) + calculateTax(invoiceItems);
};

// Generate PDF invoice
export const generateInvoice = async (invoiceDetails: InvoiceDetails): Promise<Blob> => {
  const {
    logoPreview,
    invoiceItems,
    invoiceDate,
    dueDate,
    additionalInfo,
    bankName,
    accountNumber,
    swiftCode,
    accountName,
    businessName = "Your Business Name",
    businessEmail = "business@example.com",
    businessAddress = "Business Address, Nigeria",
    clientName = "Amarachhhlii LTD",
    clientEmail = "Amarachhhli@gmail.com",
    clientAddress = "Company address, City, Nigeria - 00000"
  } = invoiceDetails;

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Add logo if provided
  if (logoPreview) {
    try {
      const img = new Image();
      img.src = logoPreview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      doc.addImage(img, 'JPEG', 160, 15, 30, 30);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
  }

  // Set font styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("INVOICE", 20, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Add invoice number and date
  const invoiceNumber = "AB2324-01";
  doc.text(`Invoice #: ${invoiceNumber}`, 20, 40);
  doc.text(`Date: ${invoiceDate ? format(invoiceDate, "dd MMM, yyyy") : "01 Jan, 2023"}`, 20, 45);
  doc.text(`Due Date: ${dueDate ? format(dueDate, "dd MMM, yyyy") : "15 Jan, 2023"}`, 20, 50);

  // Add business details
  doc.setFont("helvetica", "bold");
  doc.text("From:", 20, 60);
  doc.setFont("helvetica", "normal");
  doc.text(businessName, 20, 65);
  doc.text(businessEmail, 20, 70);
  doc.text(businessAddress, 20, 75);

  // Add client details
  doc.setFont("helvetica", "bold");
  doc.text("To:", 120, 60);
  doc.setFont("helvetica", "normal");
  doc.text(clientName, 120, 65);
  doc.text(clientEmail, 120, 70);
  doc.text(clientAddress, 120, 75);

  // Add invoice items table
  const tableColumn = ["Description", "Qty", "Price (₦)", "Tax (%)", "Total (₦)"];
  const tableRows = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    item.price.toFixed(2),
    item.tax.toString(),
    (item.quantity * item.price).toFixed(2)
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] }
  });

  // Calculate and add totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);

  doc.text("Subtotal:", 130, finalY);
  doc.text(formatNaira(subtotal).replace("NGN", "₦"), 170, finalY, { align: "right" });

  doc.text(`Tax (${(tax / subtotal * 100).toFixed(1)}%):`, 130, finalY + 5);
  doc.text(formatNaira(tax).replace("NGN", "₦"), 170, finalY + 5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("Total:", 130, finalY + 10);
  doc.text(formatNaira(total).replace("NGN", "₦"), 170, finalY + 10, { align: "right" });
  doc.setFont("helvetica", "normal");

  // Add payment details
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details:", 20, finalY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(`Account Name: ${accountName || "Company Name Ltd"}`, 20, finalY + 25);
  doc.text(`Account Number: ${accountNumber || "0123456789"}`, 20, finalY + 30);
  doc.text(`Bank Name: ${bankName || "Nigerian Bank"}`, 20, finalY + 35);
  if (swiftCode) {
    doc.text(`Sort Code: ${swiftCode}`, 20, finalY + 40);
  }

  // Add additional information
  if (additionalInfo) {
    doc.setFont("helvetica", "bold");
    doc.text("Additional Information:", 20, finalY + 50);
    doc.setFont("helvetica", "normal");
    
    // Wrap text for better formatting
    const splitText = doc.splitTextToSize(additionalInfo, 170);
    doc.text(splitText, 20, finalY + 55);
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 100, 287, { align: "center" });
    doc.text("Generated with Paytraka", 100, 292, { align: "center" });
  }

  // Generate PDF blob
  return doc.output('blob');
};

// Function to download the invoice
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

// Function to share the invoice
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
