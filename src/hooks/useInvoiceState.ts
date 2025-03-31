
import { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus, PaymentRecord } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useInvoiceState = () => {
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

  return {
    invoices,
    setInvoices,
    isLoading
  };
};
