
/**
 * Utility functions for PDF styling and formatting
 */

import jsPDF from "jspdf";

/**
 * Set up document styling for headers
 */
export const setupHeaderStyle = (doc: jsPDF) => {
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.setFont(undefined, 'bold');
};

/**
 * Set up document styling for subheaders
 */
export const setupSubheaderStyle = (doc: jsPDF) => {
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.setFont(undefined, 'normal');
};

/**
 * Set up document styling for normal text
 */
export const setupNormalTextStyle = (doc: jsPDF) => {
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.setFont(undefined, 'normal');
};

/**
 * Set up document styling for footer text
 */
export const setupFooterStyle = (doc: jsPDF) => {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'italic');
};

/**
 * Set up document styling for bold text
 */
export const setupBoldStyle = (doc: jsPDF) => {
  doc.setFont(undefined, 'bold');
};

/**
 * Reset font to normal
 */
export const resetFontStyle = (doc: jsPDF) => {
  doc.setFont(undefined, 'normal');
};

/**
 * Table column styles for jspdf-autotable
 */
export const getTableColumnStyles = () => {
  return {
    0: { cellWidth: 70 }, // Description
    1: { halign: 'center' }, // Quantity
    2: { halign: 'right' }, // Unit Price
    3: { halign: 'center' }, // Tax
    4: { halign: 'right' } // Amount
  };
};

/**
 * Table header styles for jspdf-autotable
 */
export const getTableHeaderStyles = () => {
  return {
    fillColor: [44, 62, 80],
    textColor: [255, 255, 255],
    fontSize: 11,
    fontStyle: 'bold',
    halign: 'center'
  };
};
