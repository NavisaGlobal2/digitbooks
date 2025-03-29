
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'partially-paid';

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

export interface PaymentRecord {
  amount: number;
  date: Date;
  method: string;
  receiptUrl?: string | null;
  reference?: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  invoiceNumber: string;
  issuedDate: Date;
  dueDate: Date;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  logoUrl?: string | null;
  additionalInfo?: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  payments?: PaymentRecord[];
  paidDate?: Date | null;
}
