
/**
 * Functions for adding items table to PDF invoices
 */

import jsPDF from "jspdf";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "../formatters";
import { 
  getTableHeaderStyles, 
  getTableColumnStyles,
  setupNormalTextStyle,
  setupSubheaderStyle,
  setupBoldStyle,
  resetFontStyle
} from "../pdfStyles";

/**
 * Add invoice items table
 * Returns the updated Y position
 */
export const addInvoiceItems = (doc: jsPDF, invoiceItems: InvoiceItem[], yPos: number): number => {
  const leftMargin = 15;
  setupNormalTextStyle(doc);
  
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
    headStyles: getTableHeaderStyles(),
    columnStyles: getTableColumnStyles(),
    margin: { left: leftMargin, right: 15 }
  });
  
  // Get the Y position after the table
  return (doc as any).lastAutoTable.finalY + 10;
};

/**
 * Add invoice summary (subtotal, tax, total)
 * Returns the updated Y position
 */
export const addInvoiceSummary = (doc: jsPDF, subtotal: number, tax: number, total: number, yPos: number): number => {
  const rightMargin = doc.internal.pageSize.width - 15;
  const rightColumnX = rightMargin - 50;
  
  setupNormalTextStyle(doc);
  
  doc.text("Subtotal:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(subtotal), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  doc.text("Tax:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(tax), rightMargin, yPos, { align: "right" });
  yPos += 7;
  
  setupSubheaderStyle(doc);
  setupBoldStyle(doc);
  doc.text("Total:", rightColumnX, yPos, { align: "right" });
  doc.text(formatNaira(total), rightMargin, yPos, { align: "right" });
  resetFontStyle(doc);
  
  return yPos + 15;
};
