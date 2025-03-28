
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Vendor } from '@/types/vendor';
import { Expense } from '@/types/expense';
import { useExpenses } from './ExpenseContext';

interface VendorContextType {
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'totalSpent'>) => Promise<Vendor | null>;
  updateVendor: (vendor: Vendor) => Promise<boolean>;
  deleteVendor: (id: string) => Promise<boolean>;
  getVendorById: (id: string) => Vendor | undefined;
  isLoading: boolean;
  refreshVendors: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { expenses } = useExpenses();
  
  const calculateVendorStats = (vendorNames: string[], allExpenses: Expense[]) => {
    return vendorNames.map(name => {
      const vendorExpenses = allExpenses.filter(e => e.vendor.toLowerCase() === name.toLowerCase());
      const totalSpent = vendorExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const lastTransaction = vendorExpenses.length > 0 
        ? new Date(Math.max(...vendorExpenses.map(e => e.date instanceof Date ? e.date.getTime() : new Date(e.date).getTime())))
        : undefined;
      
      return {
        id: crypto.randomUUID(),
        name,
        totalSpent,
        lastTransaction,
        createdAt: new Date()
      };
    });
  };

  // Initialize vendors from expenses on first load
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setIsLoading(true);
        
        // Extract unique vendor names from expenses
        const vendorNames = Array.from(new Set(expenses.map(expense => expense.vendor)));
        
        // Create vendor objects with calculated stats
        const vendorObjects = calculateVendorStats(vendorNames, expenses);
        
        setVendors(vendorObjects);
      } catch (error) {
        console.error("Failed to load vendors:", error);
        toast.error("Failed to load vendors");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVendors();
  }, [expenses]);

  const refreshVendors = async () => {
    setIsLoading(true);
    try {
      const vendorNames = Array.from(new Set(expenses.map(expense => expense.vendor)));
      const vendorObjects = calculateVendorStats(vendorNames, expenses);
      setVendors(vendorObjects);
    } catch (error) {
      console.error("Failed to refresh vendors:", error);
      toast.error("Failed to refresh vendors");
    } finally {
      setIsLoading(false);
    }
  };

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'totalSpent'>) => {
    try {
      const newVendor: Vendor = {
        ...vendorData,
        id: crypto.randomUUID(),
        totalSpent: 0,
        createdAt: new Date()
      };
      
      setVendors(prevVendors => [...prevVendors, newVendor]);
      toast.success("Vendor added successfully");
      return newVendor;
    } catch (error) {
      console.error("Failed to add vendor:", error);
      toast.error("Failed to add vendor");
      return null;
    }
  };

  const updateVendor = async (updatedVendor: Vendor) => {
    try {
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === updatedVendor.id ? updatedVendor : vendor
        )
      );
      toast.success("Vendor updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update vendor:", error);
      toast.error("Failed to update vendor");
      return false;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));
      toast.success("Vendor deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      toast.error("Failed to delete vendor");
      return false;
    }
  };

  const getVendorById = (id: string) => {
    return vendors.find(vendor => vendor.id === id);
  };

  return (
    <VendorContext.Provider value={{ 
      vendors, 
      addVendor, 
      updateVendor, 
      deleteVendor, 
      getVendorById,
      isLoading,
      refreshVendors
    }}>
      {children}
    </VendorContext.Provider>
  );
};
