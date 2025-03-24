
export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  status: ClientStatus;
  createdAt: string;
  invoiceCount: number;
  totalAmount: number;
}
