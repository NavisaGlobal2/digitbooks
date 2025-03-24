
/**
 * Types for PDF invoice generation
 */

import { InvoiceItem } from "@/types/invoice";

export interface InvoiceDetails {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate?: Date;
  dueDate?: Date;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  accountName: string;
  clientName?: string;
  invoiceNumber?: string;
}
