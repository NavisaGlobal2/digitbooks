
export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  category?: string;
  notes?: string;
  totalSpent: number;
  lastTransaction?: Date;
  createdAt: Date;
}
