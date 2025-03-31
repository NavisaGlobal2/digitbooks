
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { PaymentRecord } from '@/types/invoice';
import { toast } from 'sonner';

export function useInvoicePayments() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recordPayment = async (
    invoiceId: string, 
    payment: Omit<PaymentRecord, 'id' | 'date'>
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to record a payment');
      return null;
    }
    
    try {
      setIsProcessing(true);
      
      const paymentData = {
        invoice_id: invoiceId,
        user_id: user.id,
        amount: payment.amount,
        payment_method: payment.method,
        reference: payment.reference || null,
        receipt_url: payment.receiptUrl || null,
        payment_date: new Date().toISOString()
      };
      
      // Insert the payment record
      const { data, error } = await supabase
        .from('invoice_payments')
        .insert(paymentData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Get the current invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceError) {
        throw invoiceError;
      }
      
      // Convert database payment to our PaymentRecord type
      const newPayment: PaymentRecord = {
        amount: data.amount,
        date: new Date(data.payment_date),
        method: data.payment_method,
        reference: data.reference || undefined,
        receiptUrl: data.receipt_url || undefined
      };
      
      // Fetch all payments for this invoice
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('amount, payment_date, payment_method, reference, receipt_url')
        .eq('invoice_id', invoiceId);
      
      if (paymentsError) {
        throw paymentsError;
      }
      
      // Convert all payments to PaymentRecord type
      const allPayments: PaymentRecord[] = paymentsData.map(p => ({
        amount: p.amount,
        date: new Date(p.payment_date),
        method: p.payment_method,
        reference: p.reference || undefined,
        receiptUrl: p.receipt_url || undefined
      }));
      
      // Calculate total paid amount
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Determine new status
      const status = totalPaid >= invoiceData.amount ? 'paid' : 'partially-paid';
      
      // Update invoice status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);
        
      if (updateError) {
        throw updateError;
      }
      
      return {
        payment: newPayment,
        status,
        allPayments
      };
      
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast.error('Failed to record payment');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    recordPayment,
    isProcessing
  };
}
