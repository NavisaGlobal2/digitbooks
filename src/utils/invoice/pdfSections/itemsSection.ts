
/**
 * Functions for adding items table to PDF invoices
 */

import jsPDF from "jspdf";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira, formatTableCurrency } from "../formatters";
import { 
  getTableHeaderStyles, 
  getTableColumnStyles,
  getTableBodyStyles,
  getAlternateRowStyles,
  setupNormalTextStyle,
  setupSubheaderStyle,
  setupBoldStyle,
  resetFontStyle
} from "../pdfStyles";

/**
 * Add invoice items table with improved formatting
 * Returns the updated Y position
 */
export const addInvoiceItems = (doc: jsPDF, invoiceItems: InvoiceItem[], yPos: number): number => {
  const leftMargin = 15;
  setupNormalTextStyle(doc);
  
  // Transform the invoice items into a format that jspdf-autotable can use
  const tableHeaders = ["Description", "Qty", "Unit Price", "Tax (%)", "Amount"];
  
  const tableBody = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatTableCurrency(item.price),
    `${item.tax}%`,
    formatTableCurrency(item.quantity * item.price)
  ]);
  
  // Add the table with improved spacing and alignment
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    headStyles: getTableHeaderStyles(),
    columnStyles: getTableColumnStyles(),
    bodyStyles: getTableBodyStyles(),
    alternateRowStyles: getAlternateRowStyles(),
    margin: { left: leftMargin, right: 15 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1,
    didDrawCell: (data: any) => {
      // Additional cell styling if needed
    },
    // Improve cell padding for better readability
    cellPadding: {top: 5, right: 5, bottom: 5, left: 5}
  });
  
  // Get the Y position after the table and add more spacing
  return (doc as any).lastAutoTable.finalY + 10;
};

/**
 * Add invoice summary (subtotal, tax, total) with improved styling
 * Returns the updated Y position
 */
export const addInvoiceSummary = (doc: jsPDF, subtotal: number, tax: number, total: number, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  const rightColumnX = rightMargin - 60;
  const labelColumnX = rightColumnX - 40;
  
  // Add a light background for the summary section with more padding
  doc.setFillColor(245, 245, 245);
  doc.rect(labelColumnX - 5, yPos - 5, 105, 45, 'F');
  
  // Add a subtle border around the summary box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(labelColumnX - 5, yPos - 5, 105, 45);
  
  setupNormalTextStyle(doc);
  
  // Improved spacing between summary items with better alignment
  doc.setFont('helvetica', 'normal');
  doc.text("Subtotal:", labelColumnX, yPos + 8);
  doc.text(formatTableCurrency(subtotal), rightMargin, yPos + 8, { align: "right" });
  
  doc.text("Tax:", labelColumnX, yPos + 20);
  doc.text(formatTableCurrency(tax), rightMargin, yPos + 20, { align: "right" });
  
  // Add a separator line above the total
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(labelColumnX - 5, yPos + 28, rightMargin, yPos + 28);
  
  // Make the total stand out more
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text("Total:", labelColumnX, yPos + 38);
  doc.setTextColor(3, 74, 46); // Brand darker green for total amount
  doc.text(formatTableCurrency(total), rightMargin, yPos + 38, { align: "right" });
  
  // Reset text color
  doc.setTextColor(44, 62, 80); 
  
  return yPos + 45;
};
