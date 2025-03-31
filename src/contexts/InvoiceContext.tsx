
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, PaymentRecord } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoices from Supabase when the component mounts or user changes
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.id) {
        // If no user is logged in, reset invoices and stop loading
        setInvoices([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Process the data to match our Invoice type
        const processedInvoices: Invoice[] = await Promise.all(invoicesData.map(async (invoice: any) => {
          // Fetch payments for this invoice
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('invoice_payments')
            .select('*')
            .eq('invoice_id', invoice.id);
            
          if (paymentsError) {
            console.error("Failed to fetch payments:", paymentsError);
          }
          
          // Process payments if they exist
          const payments = paymentsData ? paymentsData.map((payment: any) => ({
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || undefined,
            receiptUrl: payment.receipt_url || undefined
          })) : undefined;
          
          return {
            id: invoice.id,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email || undefined,
            clientAddress: invoice.client_address || undefined,
            invoiceNumber: invoice.invoice_number,
            issuedDate: new Date(invoice.issued_date),
            dueDate: new Date(invoice.due_date),
            amount: invoice.amount,
            status: invoice.status as InvoiceStatus,
            items: Array.isArray(invoice.items) ? invoice.items : [],
            logoUrl: invoice.logo_url || undefined,
            additionalInfo: invoice.additional_info || undefined,
            bankDetails: invoice.bank_details || {
              accountName: '',
              accountNumber: '',
              bankName: ''
            },
            payments,
            paidDate: invoice.paid_date ? new Date(invoice.paid_date) : undefined
          };
        }));
        
        setInvoices(processedInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

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

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (!user?.id) {
      toast.error("You must be logged in to create an invoice");
      return;
    }

    try {
      const invoiceNumber = getNextInvoiceNumber();
      
      // Prepare invoice data for database storage
      const dbInvoiceData = {
        user_id: user.id,
        client_name: invoiceData.clientName,
        client_email: invoiceData.clientEmail || null,
        client_address: invoiceData.clientAddress || null,
        invoice_number: invoiceNumber,
        issued_date: invoiceData.issuedDate.toISOString(),
        due_date: invoiceData.dueDate.toISOString(),
        amount: invoiceData.amount,
        status: invoiceData.status,
        items: invoiceData.items || [],
        logo_url: invoiceData.logoUrl || null,
        additional_info: invoiceData.additionalInfo || null,
        bank_details: invoiceData.bankDetails || {}
      };
      
      const { data, error } = await supabase
        .from('invoices')
        .insert(dbInvoiceData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Format the returned data to match our Invoice type
      const newInvoice: Invoice = {
        id: data.id,
        clientName: data.client_name,
        clientEmail: data.client_email || undefined,
        clientAddress: data.client_address || undefined,
        invoiceNumber: data.invoice_number,
        issuedDate: new Date(data.issued_date),
        dueDate: new Date(data.due_date),
        amount: data.amount,
        status: data.status as InvoiceStatus,
        items: data.items || [],
        logoUrl: data.logo_url || undefined,
        additionalInfo: data.additional_info || undefined,
        bankDetails: data.bank_details || {
          accountName: '',
          accountNumber: '',
          bankName: ''
        },
        paidDate: data.paid_date ? new Date(data.paid_date) : undefined
      };
      
      // Update local state
      setInvoices(prev => [newInvoice, ...prev]);
      
      // Success notification
      toast.success("Invoice created successfully");
      
    } catch (error) {
      console.error("Failed to save invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status } 
            : invoice
        )
      );
      
      toast.success("Invoice status updated");
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string, payments: PaymentRecord[]) => {
    try {
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        throw new Error("Invoice not found");
      }
      
      const status = totalPaid >= invoice.amount ? 'paid' : 'partially-paid';
      const paidDate = status === 'paid' ? new Date() : null;
      
      // Update in database
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status, 
          paid_date: paidDate ? paidDate.toISOString() : null
        })
        .eq('id', invoiceId)
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setInvoices(prev => 
        prev.map(invoice => {
          if (invoice.id === invoiceId) {
            return { 
              ...invoice, 
              status,
              payments,
              paidDate
            };
          }
          return invoice;
        })
      );
      
      toast.success("Payment recorded successfully");
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
      toast.error("Failed to record payment");
    }
  };

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
