
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Vendor, VendorContextType } from './types';

// Mock vendor data for demonstration purposes
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Office Supplies Inc.',
    email: 'sales@officesupplies.com',
    phone: '555-123-4567',
    address: '123 Business Ave, Commerce City',
    website: 'officesupplies.com',
    contactName: 'John Doe',
    createdAt: new Date('2023-06-15')
  },
  {
    id: '2',
    name: 'Tech Solutions Ltd.',
    email: 'info@techsolutions.com',
    phone: '555-987-6543',
    website: 'techsolutions.com',
    createdAt: new Date('2023-08-22')
  },
  {
    id: '3',
    name: 'Global Shipping Co.',
    email: 'support@globalshipping.com',
    phone: '555-456-7890',
    address: '789 Logistics Blvd, Transport City',
    createdAt: new Date('2023-09-05')
  }
];

export const useVendorActions = (): VendorContextType => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);

  // In a real app, this would be loaded from a database
  useEffect(() => {
    // Load vendors from localStorage or API
    const storedVendors = localStorage.getItem('vendors');
    if (storedVendors) {
      try {
        const parsedVendors = JSON.parse(storedVendors);
        // Convert string dates back to Date objects
        const vendorsWithDateObjects = parsedVendors.map((vendor: any) => ({
          ...vendor,
          createdAt: new Date(vendor.createdAt)
        }));
        setVendors(vendorsWithDateObjects);
      } catch (error) {
        console.error("Failed to parse vendors from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage whenever vendors change
  useEffect(() => {
    localStorage.setItem('vendors', JSON.stringify(vendors));
  }, [vendors]);

  const addVendor = (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: uuidv4(),
      createdAt: new Date()
    };
    setVendors(prevVendors => [...prevVendors, newVendor]);
  };

  const updateVendor = (id: string, vendorUpdates: Partial<Vendor>) => {
    setVendors(prevVendors => prevVendors.map(vendor => 
      vendor.id === id ? { ...vendor, ...vendorUpdates } : vendor
    ));
  };

  const deleteVendor = (id: string) => {
    setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));
  };

  const getVendorById = (id: string) => {
    return vendors.find(vendor => vendor.id === id);
  };

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    getVendorById
  };
};
