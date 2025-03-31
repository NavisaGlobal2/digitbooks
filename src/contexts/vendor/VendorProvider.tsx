
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { VendorContext } from "./VendorContext";
import { Vendor, VendorProviderProps } from "./types";

export const VendorProvider = ({ children }: VendorProviderProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate fetching vendors from an API or local storage
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        const storedVendors = localStorage.getItem('vendors');
        if (storedVendors) {
          setVendors(JSON.parse(storedVendors));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch vendors'));
        toast.error('Failed to load vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Save vendors to localStorage whenever the state changes
  useEffect(() => {
    if (vendors.length > 0) {
      localStorage.setItem('vendors', JSON.stringify(vendors));
    }
  }, [vendors]);

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVendor: Vendor = {
        ...vendorData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setVendors(prevVendors => [...prevVendors, newVendor]);
      toast.success('Vendor added successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add vendor'));
      toast.error('Failed to add vendor');
      throw err;
    }
  };

  const updateVendor = async (id: string, vendorData: Partial<Vendor>) => {
    try {
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === id 
            ? { 
                ...vendor, 
                ...vendorData, 
                updatedAt: new Date().toISOString() 
              } 
            : vendor
        )
      );
      toast.success('Vendor updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update vendor'));
      toast.error('Failed to update vendor');
      throw err;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));
      toast.success('Vendor deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete vendor'));
      toast.error('Failed to delete vendor');
      throw err;
    }
  };

  const getVendorById = (id: string) => {
    return vendors.find(vendor => vendor.id === id);
  };

  return (
    <VendorContext.Provider
      value={{
        vendors,
        isLoading,
        error,
        addVendor,
        updateVendor,
        deleteVendor,
        getVendorById,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};
