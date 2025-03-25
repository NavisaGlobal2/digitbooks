
/**
 * Functions for adding items table to PDF invoices
 */

import jsPDF from "jspdf";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "../formatters";
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
  
  const tableData = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatNaira(item.price),
    `${item.tax}%`,
    formatNaira(item.quantity * item.price)
  ]);
  
  // Add the table with improved spacing and alignment
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableData,
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
  const rightColumnX = rightMargin - 50;
  
  // Add a light background for the summary section with more padding
  doc.setFillColor(248, 248, 248);
  doc.rect(rightColumnX - 15, yPos - 5, 75, 40, 'F');
  
  // Add a subtle border around the summary box
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(rightColumnX - 15, yPos - 5, 75, 40);
  
  setupNormalTextStyle(doc);
  
  // Improved spacing between summary items
  doc.text("Subtotal:", rightColumnX, yPos + 5, { align: "right" });
  doc.text(formatNaira(subtotal), rightMargin, yPos + 5, { align: "right" });
  yPos += 10;
  
  doc.text("Tax:", rightColumnX, yPos + 5, { align: "right" });
  doc.text(formatNaira(tax), rightMargin, yPos + 5, { align: "right" });
  yPos += 10;
  
  // Add a separator line above the total
  doc.setDrawColor(180, 180, 180);
  doc.line(rightColumnX - 15, yPos + 2, rightMargin, yPos + 2);
  
  // Make the total stand out more
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Total:", rightColumnX, yPos + 12, { align: "right" });
  doc.setTextColor(5, 209, 102); // Brand green for total amount
  doc.text(formatNaira(total), rightMargin, yPos + 12, { align: "right" });
  resetFontStyle(doc);
  doc.setTextColor(44, 62, 80); // Reset text color
  
  return yPos + 25;
};
