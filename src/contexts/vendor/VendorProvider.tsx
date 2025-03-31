
import React, { createContext, useContext } from 'react';
import { VendorContextType } from './types';
import { useVendorActions } from './useVendorActions';

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const vendorActions = useVendorActions();

  return (
    <VendorContext.Provider value={vendorActions}>
      {children}
    </VendorContext.Provider>
  );
};
