
import { InvoiceItem } from "@/types/invoice";

export interface InvoiceDetails {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate?: Date;
  dueDate?: Date;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  selectedTemplate: string;
  invoiceNumber?: string;
}
