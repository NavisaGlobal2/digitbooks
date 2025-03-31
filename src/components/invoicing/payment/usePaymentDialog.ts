
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PaymentRecord } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface UsePaymentDialogProps {
  invoiceId: string;
  invoiceAmount: number;
  existingPayments: PaymentRecord[];
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

interface DatabasePaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  receipt_url: string | null;
}

export const usePaymentDialog = ({
  invoiceId,
  invoiceAmount,
  existingPayments,
  onMarkAsPaid,
  onOpenChange
}: UsePaymentDialogProps) => {
  const [payments, setPayments] = useState<(PaymentRecord & { id: string })[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load existing payment records from database on mount
  useEffect(() => {
    const fetchPaymentRecords = async () => {
      if (!user || !invoiceId) return;
      
      setIsLoading(true);
      
      try {
        // Type cast the table name until types are properly set up
        const { data, error } = await supabase
          .from('invoice_payments' as any)
          .select('*')
          .eq('invoice_id', invoiceId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // If we have DB payments, use them instead of the local ones
        if (data && data.length > 0) {
          const dbPayments = data.map((payment: DatabasePaymentRecord) => ({
            id: payment.id,
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || undefined,
            receiptUrl: payment.receipt_url || null
          }));
          
          setPayments(dbPayments);
          
          // Calculate total from DB payments
          const dbTotal = dbPayments.reduce((sum, payment) => sum + payment.amount, 0);
          setTotalPaid(dbTotal);
          return;
        }
      } catch (error) {
        console.error("Error fetching payment records:", error);
      } finally {
        setIsLoading(false);
      }
      
      // If no DB records found or error occurred, initialize with existing local payments or default
      if (existingPayments && existingPayments.length > 0) {
        // Convert existing payments to internal format with id
        const paymentsWithIds = existingPayments.map(payment => ({
          ...payment,
          id: crypto.randomUUID(),
          date: new Date(payment.date)
        }));
        setPayments(paymentsWithIds);
        
        // Calculate total from existing payments
        const existingTotal = paymentsWithIds.reduce((sum, payment) => sum + payment.amount, 0);
        setTotalPaid(existingTotal);
      } else {
        // Initialize with a single default payment with zero amount
        setPayments([
          { 
            id: crypto.randomUUID(), 
            amount: 0,
            date: new Date(), 
            method: "bank transfer", 
            receiptUrl: null 
          }
        ]);
        setTotalPaid(0);
      }
      
      setIsLoading(false);
    };
    
    fetchPaymentRecords();
  }, [invoiceId, invoiceAmount, existingPayments, user]);

  const resetState = useCallback(() => {
    setPayments([]);
    setTotalPaid(0);
    setIsSubmitting(false);
    setIsLoading(false);
  }, []);

  const handleAddPayment = useCallback(() => {
    const newPayment = {
      id: crypto.randomUUID(),
      amount: 0,
      date: new Date(),
      method: "bank transfer",
      receiptUrl: null
    };
    
    setPayments(prevPayments => [...prevPayments, newPayment]);
  }, []);

  const handleRemovePayment = useCallback((id: string) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.filter(payment => payment.id !== id);
      
      // Recalculate total
      const newTotal = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalPaid(newTotal);
      
      return updatedPayments;
    });
  }, []);

  const handlePaymentChange = useCallback((id: string, field: keyof PaymentRecord, value: any) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.map(payment => {
        if (payment.id === id) {
          return { ...payment, [field]: value };
        }
        return payment;
      });
      
      // Recalculate total if amount changed
      if (field === 'amount') {
        const newTotal = updatedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        setTotalPaid(newTotal);
      }
      
      return updatedPayments;
    });
  }, []);

  const handleFileUpload = useCallback(async (id: string, file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }
    
    try {
      // In a real app with Supabase Storage, we'd upload to storage:
      // const { data, error } = await supabase.storage
      //   .from('receipts')
      //   .upload(`receipts/${user.id}/${file.name}`, file);
      
      // For now, create a local URL
      const receiptUrl = URL.createObjectURL(file);
      
      handlePaymentChange(id, 'receiptUrl', receiptUrl);
      toast.success(`Receipt uploaded successfully`);
    } catch (error) {
      console.error("Failed to upload receipt:", error);
      toast.error("Failed to upload receipt");
    }
  }, [handlePaymentChange, user]);

  const handleSubmit = useCallback(async () => {
    if (totalPaid === 0) {
      toast.error("Total payment amount cannot be zero");
      return;
    }
    
    if (totalPaid < invoiceAmount) {
      if (!confirm("Total payment amount is less than invoice amount. This will mark the invoice as partially paid. Continue?")) {
        return;
      }
    } else if (totalPaid > invoiceAmount) {
      if (!confirm("Total payment amount exceeds invoice amount. This may indicate an overpayment. Continue?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove the internal id property before sending to parent
      const paymentRecords: PaymentRecord[] = payments.map(({ id, ...rest }) => rest);
      
      // Call the parent handler
      await onMarkAsPaid(invoiceId, paymentRecords);
      
      // Close the dialog
      onOpenChange(false);
      
      // Success notification
      toast.success("Payment records saved successfully");
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to save payment records");
    } finally {
      setIsSubmitting(false);
    }
  }, [invoiceId, invoiceAmount, payments, totalPaid, onMarkAsPaid, onOpenChange]);

  return {
    payments,
    totalPaid,
    isSubmitting,
    isLoading,
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleFileUpload,
    handleSubmit,
    resetState
  };
};
