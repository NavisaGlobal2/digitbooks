
/**
 * Table component for minimalist invoice template
 */
import jsPDF from "jspdf";
import { InvoiceItem } from "@/types/invoice";
import { formatNaira } from "../../formatters";

/**
 * Render items table with minimalist styling
 */
export const renderTable = (
  doc: jsPDF,
  invoiceItems: InvoiceItem[],
  yPos: number,
  colors: any,
  margins: any
): number => {
  // Column positions
  const startX = margins.left;
  const col1 = startX; // Description
  const col2 = startX + 120; // Quantity
  const col3 = startX + 150; // Price
  const col4 = startX + 180; // Tax
  const col5 = startX + 210; // Amount
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("DESCRIPTION", col1, yPos);
  doc.text("QTY", col2, yPos);
  doc.text("PRICE", col3, yPos);
  doc.text("TAX", col4, yPos);
  doc.text("AMOUNT", col5, yPos);
  
  // Simple separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(startX, yPos + 3, startX + 220, yPos + 3);
  
  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let rowY = yPos + 15;
  const rowHeight = 12;
  
  for (const item of invoiceItems) {
    // Split long descriptions to multiple lines if needed
    const descriptionLines = doc.splitTextToSize(item.description, 110);
    const descriptionHeight = descriptionLines.length * 5;
    
    // Calculate row height based on description length
    const currentRowHeight = Math.max(rowHeight, descriptionHeight);
    
    // Description (possibly multi-line)
    doc.text(descriptionLines, col1, rowY);
    
    // Quantity (centered)
    doc.text(item.quantity.toString(), col2, rowY, { align: 'left' });
    
    // Price (right-aligned)
    doc.text(formatNaira(item.price), col3, rowY, { align: 'left' });
    
    // Tax (centered)
    doc.text(`${item.tax}%`, col4, rowY, { align: 'left' });
    
    // Amount (right-aligned)
    doc.text(formatNaira(item.quantity * item.price), col5, rowY, { align: 'left' });
    
    // Row separator
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(startX, rowY + 5, startX + 220, rowY + 5);
    
    // Update position for next row
    rowY += currentRowHeight;
  }
  
  return rowY + 5;
};
