
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
    swiftCode: string;
  }
}
