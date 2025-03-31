
import React, { createContext, useContext } from 'react';
import { InvoiceContextType } from './types';
import { useInvoiceActions } from './useInvoiceActions';

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const invoiceActions = useInvoiceActions();

  return (
    <InvoiceContext.Provider value={invoiceActions}>
      {children}
    </InvoiceContext.Provider>
  );
};
