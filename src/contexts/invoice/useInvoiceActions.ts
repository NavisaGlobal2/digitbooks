
import { useState, useCallback, useEffect } from 'react';
import { Invoice, InvoiceStatus, PaymentRecord } from '@/types/invoice';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from '@/contexts/auth';

export const useInvoiceActions = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  // Load invoices from localStorage on component mount
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

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to store invoices:", error);
    }
  }, [invoices]);

  const getNextInvoiceNumber = useCallback(() => {
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
  }, [invoices]);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
    };
    
    setInvoices(prev => [newInvoice, ...prev]);

    if (user) {
      try {
        await supabase.from('invoices').insert({
          id: newInvoice.id,
          client_name: newInvoice.clientName,
          invoice_number: newInvoice.invoiceNumber,
          amount: newInvoice.amount,
          status: newInvoice.status,
          issued_date: new Date(newInvoice.issuedDate).toISOString(),
          due_date: new Date(newInvoice.dueDate).toISOString(),
          items: JSON.stringify(newInvoice.items),
          bank_details: newInvoice.bankDetails,
          logo_url: newInvoice.logoUrl,
          additional_info: newInvoice.additionalInfo,
          user_id: user.id
        });
      } catch (error) {
        console.error("Failed to save invoice to Supabase:", error);
      }
    }
  }, [getNextInvoiceNumber, user]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: InvoiceStatus) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status } 
          : invoice
      )
    );
    
    if (user) {
      try {
        supabase.from('invoices')
          .update({ status })
          .eq('id', invoiceId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error("Failed to update invoice status in Supabase:", error);
      }
    }
  }, [user]);

  const markInvoiceAsPaid = useCallback(async (invoiceId: string, payments: PaymentRecord[]) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found");
      return Promise.reject("Invoice not found");
    }

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const status = totalPaid >= invoice.amount ? 'paid' : 'partially-paid';
    
    setInvoices(prev => 
      prev.map(inv => {
        if (inv.id === invoiceId) {
          return { 
            ...inv, 
            status,
            payments: payments,
            paidDate: status === 'paid' ? new Date() : inv.paidDate
          };
        }
        return inv;
      })
    );

    if (user) {
      try {
        await supabase.from('invoices')
          .update({ 
            status,
            ...(status === 'paid' ? { paid_date: new Date().toISOString() } : {})
          })
          .eq('id', invoiceId)
          .eq('user_id', user.id);
        
        const { error: deletionError } = await supabase
          .from('invoice_payments')
          .delete()
          .eq('invoice_id', invoiceId)
          .eq('user_id', user.id);
          
        if (deletionError) throw deletionError;
        
        const paymentRecords = payments.map(payment => ({
          invoice_id: invoiceId,
          amount: payment.amount,
          payment_date: new Date(payment.date).toISOString(),
          payment_method: payment.method,
          reference: payment.reference || null,
          receipt_url: payment.receiptUrl || null,
          user_id: user.id
        }));
        
        if (paymentRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('invoice_payments')
            .insert(paymentRecords);
            
          if (insertError) throw insertError;
        }
        
        return Promise.resolve();
      } catch (error) {
        console.error("Failed to save payment records to Supabase:", error);
        toast.error("Failed to save payment records to database");
        return Promise.reject(error);
      }
    }
    
    return Promise.resolve();
  }, [invoices, user]);

  return {
    invoices,
    addInvoice,
    getNextInvoiceNumber,
    updateInvoiceStatus,
    markInvoiceAsPaid
  };
};
