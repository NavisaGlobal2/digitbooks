
import { ReactNode } from "react";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorContextType {
  vendors: Vendor[];
  isLoading: boolean;
  error: Error | null;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;
}

export interface VendorProviderProps {
  children: ReactNode;
}
