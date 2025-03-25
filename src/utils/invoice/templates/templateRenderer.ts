
/**
 * Invoice template renderer system
 */

import jsPDF from "jspdf";
import { InvoiceTemplateProps } from "./types";
import { renderDefaultTemplate } from "./defaultTemplate";
import { renderProfessionalTemplate } from "./professional";
import { renderMinimalistTemplate } from "./minimalistTemplate";

/**
 * Renders the appropriate invoice template based on selection
 */
export const renderInvoiceTemplate = (doc: jsPDF, props: InvoiceTemplateProps): void => {
  // Set default font family for all templates
  doc.setFont('helvetica');
  
  // Render the selected template
  switch (props.selectedTemplate) {
    case "professional":
      renderProfessionalTemplate(doc, props);
      break;
    case "minimalist":
      renderMinimalistTemplate(doc, props);
      break;
    case "default":
    default:
      renderDefaultTemplate(doc, props);
      break;
  }
};
