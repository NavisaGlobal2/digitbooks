
export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  contactName?: string;
  notes?: string;
  createdAt: Date;
}

export interface VendorContextType {
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  getVendorById: (id: string) => Vendor | undefined;
}
