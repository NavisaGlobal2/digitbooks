
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
  
  // Add the table with improved styling
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
    }
  });
  
  // Get the Y position after the table
  return (doc as any).lastAutoTable.finalY + 10;
};

/**
 * Add invoice summary (subtotal, tax, total) with improved styling
 * Returns the updated Y position
 */
export const addInvoiceSummary = (doc: jsPDF, subtotal: number, tax: number, total: number, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  const rightColumnX = rightMargin - 50;
  
  // Add a light background for the summary section
  doc.setFillColor(248, 248, 248);
  doc.rect(rightColumnX - 10, yPos - 5, 70, 32, 'F');
  
  setupNormalTextStyle(doc);
  
  doc.text("Subtotal:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(subtotal), rightMargin, yPos, { align: "right" });
  yPos += 8;
  
  doc.text("Tax:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(tax), rightMargin, yPos, { align: "right" });
  yPos += 8;
  
  // Add a separator line above the total
  doc.setDrawColor(200, 200, 200);
  doc.line(rightColumnX - 10, yPos - 3, rightMargin, yPos - 3);
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Total:", rightColumnX, yPos, { align: "right" });
  doc.setTextColor(5, 209, 102); // Brand green for total amount
  doc.text(formatNaira(total), rightMargin, yPos, { align: "right" });
  resetFontStyle(doc);
  doc.setTextColor(44, 62, 80); // Reset text color
  
  return yPos + 15;
};
