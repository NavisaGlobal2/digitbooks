
import { InvoiceItem } from "@/types/invoice";
import { InvoiceDetails } from "../pdfSections/types";

/**
 * Common calculation functions used across document actions
 */
export const calculateSubtotal = (items: { quantity: number; price: number }[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
};

export const calculateTax = (items: { quantity: number; price: number; tax: number }[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.price * (item.tax / 100)), 0);
};

export const calculateTotal = (items: { quantity: number; price: number; tax: number }[]) => {
  return calculateSubtotal(items) + calculateTax(items);
};
