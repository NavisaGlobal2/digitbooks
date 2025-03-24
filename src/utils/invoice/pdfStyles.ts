
/**
 * Utility functions for PDF styling and formatting
 */

import jsPDF from "jspdf";

/**
 * Set up document styling for headers
 */
export const setupHeaderStyle = (doc: jsPDF) => {
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
};

/**
 * Set up document styling for subheaders
 */
export const setupSubheaderStyle = (doc: jsPDF) => {
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
};

/**
 * Set up document styling for normal text
 */
export const setupNormalTextStyle = (doc: jsPDF) => {
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
};

/**
 * Set up document styling for footer text
 */
export const setupFooterStyle = (doc: jsPDF) => {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
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
    0: { cellWidth: 70 },
    1: { halign: 'center' },
    2: { halign: 'right' },
    3: { halign: 'center' },
    4: { halign: 'right' }
  };
};

/**
 * Table header styles for jspdf-autotable
 */
export const getTableHeaderStyles = () => {
  return {
    fillColor: [44, 62, 80],
    textColor: [255, 255, 255],
    fontSize: 12,
    halign: 'center'
  };
};
