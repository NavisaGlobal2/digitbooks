
import React, { createContext, useContext } from 'react';
import { Invoice, InvoiceStatus, PaymentRecord } from '@/types/invoice';
import { useInvoiceState } from '@/hooks/useInvoiceState';
import { useInvoiceOperations } from '@/hooks/useInvoiceOperations';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  getNextInvoiceNumber: () => string;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  markInvoiceAsPaid: (invoiceId: string, payments: PaymentRecord[]) => void;
  isLoading: boolean;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { invoices, setInvoices, isLoading } = useInvoiceState();
  const { getNextInvoiceNumber, addInvoice, updateInvoiceStatus, markInvoiceAsPaid } = useInvoiceOperations(invoices, setInvoices);

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      addInvoice, 
      getNextInvoiceNumber,
      updateInvoiceStatus,
      markInvoiceAsPaid,
      isLoading
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};
