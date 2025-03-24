
import { InvoiceItem } from "@/types/invoice";

/**
 * Utility functions for calculating invoice amounts
 */

// Calculate subtotal
export const calculateSubtotal = (invoiceItems: InvoiceItem[]) => {
  return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};

// Calculate tax
export const calculateTax = (invoiceItems: InvoiceItem[]) => {
  return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0);
};

// Calculate total
export const calculateTotal = (invoiceItems: InvoiceItem[]) => {
  return calculateSubtotal(invoiceItems) + calculateTax(invoiceItems);
};

