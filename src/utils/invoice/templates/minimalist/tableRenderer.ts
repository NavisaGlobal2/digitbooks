
/**
 * Table component for minimalist invoice template
 */
import jsPDF from "jspdf";
import { formatTableCurrency } from "../../formatters";

/**
 * Render invoice items table with minimalist styling
 */
export const renderTable = (
  doc: jsPDF,
  invoiceItems: any[],
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Set up table headers and data
  const tableHeaders = ["Item", "Qty", "Price", "Tax", "Amount"];
  
  const tableBody = invoiceItems.map(item => [
    item.description,
    item.quantity.toString(),
    formatTableCurrency(item.price),
    `${item.tax}%`,
    formatTableCurrency(item.quantity * item.price)
  ]);
  
  // Create the table with minimal styling
  (doc as any).autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableBody,
    margin: { left: margins.left, right: margins.right },
    headStyles: {
      fillColor: [255, 255, 255], // White background
      textColor: [80, 80, 80],    // Dark gray text
      fontSize: 10,
      fontStyle: 'bold',
      lineWidth: 0,
      lineColor: [220, 220, 220],
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 9,
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    },
    didParseCell: (data: any) => {
      // Add subtle bottom border to header cells only
      if (data.row.index === 0) {
        data.cell.styles.lineWidth = [0, 0, 0.5, 0];
        data.cell.styles.lineColor = [220, 220, 220];
      }
    },
    tableLineColor: [255, 255, 255], // No border around table
    tableLineWidth: 0
  });
  
  return (doc as any).lastAutoTable.finalY;
};
