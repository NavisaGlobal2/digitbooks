
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { calculateSubtotal, calculateTax, calculateTotal } from "./calculations";
import { formatNaira } from "./formatters";

export interface InvoiceDetails {
  logoPreview: string | null;
  invoiceItems: { description: string; quantity: number; price: number; tax: number }[];
  invoiceDate?: Date;
  dueDate?: Date;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  accountName: string;
  clientName?: string;
  invoiceNumber?: string;
}

/**
 * Generate a PDF invoice
 */
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
    clientName = "Client",
    invoiceNumber = format(new Date(), "yyyyMMdd")
  } = invoiceDetails;

  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set up some variables for positioning
  let yPos = 20;
  const leftMargin = 15;
  const rightMargin = doc.internal.pageSize.width - 15;
  const pageWidth = doc.internal.pageSize.width;
  
  // Add logo if available
  if (logoPreview) {
    try {
      doc.addImage(logoPreview, 'PNG', leftMargin, yPos, 40, 20);
      yPos += 25;
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
  } else {
    // Add company name if no logo
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Your Company", leftMargin, yPos);
    yPos += 10;
  }
  
  // Add invoice title and number
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoiceNumber}`, rightMargin, yPos, { align: "right" });
  yPos += 8;
  
  // Add dates
  const issuedDateStr = invoiceDate ? format(invoiceDate, "MMMM dd, yyyy") : format(new Date(), "MMMM dd, yyyy");
  const dueDateStr = dueDate ? format(dueDate, "MMMM dd, yyyy") : "N/A";
  
  doc.text(`Issued: ${issuedDateStr}`, rightMargin, yPos, { align: "right" });
  yPos += 7;
  doc.text(`Due: ${dueDateStr}`, rightMargin, yPos, { align: "right" });
  yPos += 15;
  
  // Add client information
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text("Bill To:", leftMargin, yPos);
  yPos += 7;
  doc.setFontSize(14);
  doc.text(clientName, leftMargin, yPos);
  yPos += 15;
  
  // Add invoice items
  doc.setFontSize(12);
  
  // Transform the invoice items into a format that jspdf-autotable can use
  const tableHeaders = [
    { header: "Description", dataKey: "desc" },
    { header: "Quantity", dataKey: "qty" },
    { header: "Unit Price", dataKey: "price" },
    { header: "Tax (%)", dataKey: "tax" },
    { header: "Amount", dataKey: "amount" }
  ];
  
  const tableData = invoiceItems.map(item => ({
    desc: item.description,
    qty: item.quantity.toString(),
    price: formatNaira(item.price),
    tax: `${item.tax}%`,
    amount: formatNaira(item.quantity * item.price)
  }));
  
  // Add the table
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders.map(h => h.header)],
    body: tableData.map(row => [
      row.desc,
      row.qty,
      row.price,
      row.tax,
      row.amount
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 12,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    margin: { left: leftMargin, right: 15 }
  });
  
  // Get the Y position after the table
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Add subtotal, tax and total
  const subtotal = calculateSubtotal(invoiceItems);
  const tax = calculateTax(invoiceItems);
  const total = calculateTotal(invoiceItems);
  
  const rightColumnX = rightMargin - 50;
  
  doc.text("Subtotal:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(subtotal), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  doc.text("Tax:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(tax), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Total:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(total), rightMargin, yPos, { align: "right" });
  yPos += 15;
  
  // Reset font
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  
  // Add payment information
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.text("Payment Information", leftMargin, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.text(`Bank: ${bankName}`, leftMargin, yPos);
  yPos += 7;
  doc.text(`Account Name: ${accountName}`, leftMargin, yPos);
  yPos += 7;
  doc.text(`Account Number: ${accountNumber}`, leftMargin, yPos);
  yPos += 7;
  if (swiftCode) {
    doc.text(`Swift Code: ${swiftCode}`, leftMargin, yPos);
    yPos += 7;
  }
  
  // Add additional information if provided
  if (additionalInfo) {
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.text("Additional Information", leftMargin, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    // Split long text into multiple lines
    const textLines = doc.splitTextToSize(additionalInfo, rightMargin - leftMargin);
    doc.text(textLines, leftMargin, yPos);
  }
  
  // Add footer with thank you message
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, { align: "center" });
  
  // Convert the PDF to a Blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
