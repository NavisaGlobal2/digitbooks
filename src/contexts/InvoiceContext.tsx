
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  getNextInvoiceNumber: () => string;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load invoices from localStorage on mount
  useEffect(() => {
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      try {
        const parsedInvoices = JSON.parse(storedInvoices);
        
        // Convert string dates back to Date objects
        const processedInvoices = parsedInvoices.map((invoice: any) => ({
          ...invoice,
          issuedDate: new Date(invoice.issuedDate),
          dueDate: new Date(invoice.dueDate),
        }));
        
        setInvoices(processedInvoices);
      } catch (error) {
        console.error("Failed to parse stored invoices:", error);
      }
    }
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV-${year}${month}-`;
    
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(prefix))
      .map(num => parseInt(num.replace(prefix, ''), 10));
    
    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status } 
          : invoice
      )
    );
  };

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      addInvoice, 
      getNextInvoiceNumber,
      updateInvoiceStatus 
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};
