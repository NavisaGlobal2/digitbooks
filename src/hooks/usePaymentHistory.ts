
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Invoice, PaymentRecord } from '@/types/invoice';

interface DbInvoice {
  id: string;
  client_name: string;
  invoice_number: string;
  issued_date: string;
  due_date: string;
  amount: number;
  status: string;
  items: any;
  logo_url?: string;
  additional_info?: string;
  bank_details: any;
}

interface DbPayment {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  receipt_url?: string;
}

export const usePaymentHistory = () => {
  const [invoicesWithPayments, setInvoicesWithPayments] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        // Fetch all invoices that have payments (both paid and partially-paid)
        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select('*')
          .in('status', ['paid', 'partially-paid'])
          .eq('user_id', user.id);

        if (error) throw error;

        // For each invoice, fetch its payments
        const invoicesWithPaymentsPromises = invoicesData.map(async (invoice: DbInvoice) => {
          const { data: payments, error: paymentsError } = await supabase
            .from('invoice_payments')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (paymentsError) {
            console.error("Failed to fetch payments for invoice:", invoice.id, paymentsError);
            return null;
          }

          // Map the payments to our format
          const formattedPayments: PaymentRecord[] = payments.map((payment: DbPayment) => ({
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || undefined,
            receiptUrl: payment.receipt_url || undefined
          }));

          // Parse JSON fields from the database
          const parsedItems = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
          const parsedBankDetails = typeof invoice.bank_details === 'string' ? 
            JSON.parse(invoice.bank_details) : 
            invoice.bank_details;

          // Convert DB invoice to our Invoice format with type assertion
          const formattedInvoice = {
            id: invoice.id,
            clientName: invoice.client_name,
            clientEmail: undefined,
            clientAddress: undefined,
            invoiceNumber: invoice.invoice_number,
            issuedDate: new Date(invoice.issued_date),
            dueDate: new Date(invoice.due_date),
            amount: invoice.amount,
            status: invoice.status,
            items: parsedItems,
            logoUrl: invoice.logo_url || undefined,
            additionalInfo: invoice.additional_info || undefined,
            bankDetails: parsedBankDetails,
            paidDate: undefined, // This field doesn't exist in the database
            payments: formattedPayments
          } as Invoice;

          return formattedInvoice;
        });

        const results = await Promise.all(invoicesWithPaymentsPromises);
        
        // Sort by payment date (most recent first)
        const sortedInvoices = results
          .filter(Boolean) as Invoice[];
          
        // Sort invoices by most recent payment date
        sortedInvoices.sort((a, b) => {
          // Get the most recent payment date for each invoice
          const latestPaymentA = a.payments && a.payments.length > 0 
            ? Math.max(...a.payments.map(p => p.date.getTime())) 
            : a.issuedDate.getTime();
            
          const latestPaymentB = b.payments && b.payments.length > 0 
            ? Math.max(...b.payments.map(p => p.date.getTime())) 
            : b.issuedDate.getTime();
            
          return latestPaymentB - latestPaymentA;
        });
          
        setInvoicesWithPayments(sortedInvoices);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        toast.error("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);
  
  const handleDownloadReceipt = async (receiptUrl?: string) => {
    if (!receiptUrl) {
      toast.error("No receipt available for this payment");
      return;
    }

    try {
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  return {
    invoicesWithPayments,
    isLoading,
    handleDownloadReceipt
  };
};
