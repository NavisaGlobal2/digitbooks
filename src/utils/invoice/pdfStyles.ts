
/**
 * Utility functions for PDF styling and formatting
 */

import jsPDF from "jspdf";

/**
 * Set up document styling for headers
 */
export const setupHeaderStyle = (doc: jsPDF) => {
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80); // Dark blue-gray for better readability
  doc.setFont('helvetica', 'bold');
};

/**
 * Set up document styling for subheaders
 */
export const setupSubheaderStyle = (doc: jsPDF) => {
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'normal');
};

/**
 * Set up document styling for normal text
 */
export const setupNormalTextStyle = (doc: jsPDF) => {
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'normal');
};

/**
 * Set up document styling for footer text
 */
export const setupFooterStyle = (doc: jsPDF) => {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
};

/**
 * Set up document styling for bold text
 */
export const setupBoldStyle = (doc: jsPDF) => {
  doc.setFont('helvetica', 'bold');
};

/**
 * Reset font to normal
 */
export const resetFontStyle = (doc: jsPDF) => {
  doc.setFont('helvetica', 'normal');
};

/**
 * Table column styles for jspdf-autotable with improved formatting
 */
export const getTableColumnStyles = () => {
  return {
    0: { cellWidth: 'auto', fontStyle: 'normal', minCellWidth: 60 }, // Description - wider
    1: { halign: 'center', fontStyle: 'normal', cellWidth: 20 }, // Quantity - fixed width
    2: { halign: 'right', fontStyle: 'normal', cellWidth: 35, cellPadding: { right: 8 } }, // Unit Price - fixed width with padding
    3: { halign: 'center', fontStyle: 'normal', cellWidth: 20 }, // Tax - fixed width
    4: { halign: 'right', fontStyle: 'normal', cellWidth: 35, cellPadding: { right: 8 } } // Amount - fixed width with padding
  };
};

/**
 * Table header styles for jspdf-autotable with improved contrast
 */
export const getTableHeaderStyles = () => {
  return {
    fillColor: [3, 74, 46], // Darker green for header
    textColor: [255, 255, 255],
    fontSize: 12,
    fontStyle: 'bold',
    halign: 'center',
    valign: 'middle',
    lineWidth: 0.5,
    lineColor: [3, 74, 46],
    cellPadding: 8 // Increased padding for headers
  };
};

/**
 * Table body styles for better readability
 */
export const getTableBodyStyles = () => {
  return {
    fontSize: 11, // Slightly larger for better readability
    cellPadding: 6,
    lineColor: [220, 220, 220],
    lineWidth: 0.2 // Thinner lines for a more elegant look
  };
};

/**
 * Get alternating row styles for better readability
 */
export const getAlternateRowStyles = () => {
  return {
    0: {
      fillColor: [255, 255, 255]
    },
    1: {
      fillColor: [248, 248, 248]
    }
  };
};
