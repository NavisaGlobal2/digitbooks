
/**
 * Invoice items table component for professional invoice template
 */
import jsPDF from "jspdf";
import { formatNaira } from "../../formatters";

/**
 * Render invoice items table with improved formatting
 */
export const renderItemsTable = (
  doc: jsPDF, 
  invoiceItems: any[],
  yPos: number,
  margins: any
): number => {
  // Transform the invoice items into table format
  const tableHeaders = [
    "Description", 
    "Qty", 
    "Unit Price", 
    "Tax (%)", 
    "Amount"
  ];
  
  const tableBody = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatNaira(item.price),
    `${item.tax}%`,
    formatNaira(item.quantity * item.price)
  ]);
  
  // Create the table
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    margin: { left: margins.left, right: margins.right },
    headStyles: {
      fillColor: [3, 74, 46], // Darker green for professional look
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      lineWidth: 0.5,
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 10,
      lineColor: [220, 220, 220],
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1
  });
  
  return (doc as any).lastAutoTable.finalY;
};
