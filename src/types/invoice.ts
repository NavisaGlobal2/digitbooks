
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  invoiceNumber: string;
  issuedDate: Date;
  dueDate: Date;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  logoUrl?: string | null;
  additionalInfo?: string;
  template?: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  }
}
