
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, PaymentRecord } from '@/types/invoice';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  getNextInvoiceNumber: () => string;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  markInvoiceAsPaid: (invoiceId: string, payments: PaymentRecord[]) => void;
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

  useEffect(() => {
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      try {
        const parsedInvoices = JSON.parse(storedInvoices);
        
        const processedInvoices = parsedInvoices.map((invoice: any) => ({
          ...invoice,
          issuedDate: new Date(invoice.issuedDate),
          dueDate: new Date(invoice.dueDate),
          paidDate: invoice.paidDate ? new Date(invoice.paidDate) : null,
          payments: invoice.payments 
            ? invoice.payments.map((payment: any) => ({
                ...payment,
                date: new Date(payment.date)
              })) 
            : undefined
        }));
        
        setInvoices(processedInvoices);
      } catch (error) {
        console.error("Failed to parse stored invoices:", error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to store invoices:", error);
    }
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

  const markInvoiceAsPaid = (invoiceId: string, payments: PaymentRecord[]) => {
    setInvoices(prev => 
      prev.map(invoice => {
        if (invoice.id === invoiceId) {
          const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
          
          const status = totalPaid >= invoice.amount ? 'paid' : 'partially-paid';
          
          return { 
            ...invoice, 
            status,
            payments: payments,
            paidDate: status === 'paid' ? new Date() : invoice.paidDate
          };
        }
        return invoice;
      })
    );
  };

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      addInvoice, 
      getNextInvoiceNumber,
      updateInvoiceStatus,
      markInvoiceAsPaid
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};
