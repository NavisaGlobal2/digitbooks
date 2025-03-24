
/**
 * Types for invoice template system
 */

import jsPDF from "jspdf";
import { InvoiceItem } from "@/types/invoice";
import { InvoiceDetails } from "../pdfSections/types";

export interface InvoiceTemplateProps extends InvoiceDetails {
  subtotal: number;
  tax: number;
  total: number;
}

export type TemplateRenderer = (doc: jsPDF, props: InvoiceTemplateProps) => void;

export interface TemplateColors {
  primary: [number, number, number];
  secondary: [number, number, number];
  text: [number, number, number];
  background: [number, number, number];
  accent: [number, number, number];
}

export interface TemplateConfig {
  colors: TemplateColors;
  fonts: {
    header: string;
    body: string;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
