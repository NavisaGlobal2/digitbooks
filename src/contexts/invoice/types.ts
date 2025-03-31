
import { Invoice, PaymentRecord, InvoiceStatus } from '@/types/invoice';

export interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  getNextInvoiceNumber: () => string;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  markInvoiceAsPaid: (invoiceId: string, payments: PaymentRecord[]) => Promise<void>;
}
