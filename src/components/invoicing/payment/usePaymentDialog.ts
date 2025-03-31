
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PaymentRecord } from "@/types/invoice";

interface UsePaymentDialogProps {
  invoiceId: string;
  invoiceAmount: number;
  existingPayments: PaymentRecord[];
  onMarkAsPaid: (invoiceId: string, payments: PaymentRecord[]) => void;
  onOpenChange: (open: boolean) => void;
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

  // Initialize with existing payments or a default payment
  useEffect(() => {
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
      // This ensures we don't show as paid until user sets amount
      setPayments([
        { 
          id: crypto.randomUUID(), 
          amount: 0, // Initialize with zero instead of full invoice amount
          date: new Date(), 
          method: "bank transfer", 
          receiptUrl: null 
        }
      ]);
      setTotalPaid(0); // Set total paid to zero initially
    }
  }, [existingPayments, invoiceAmount]);

  const resetState = useCallback(() => {
    setPayments([]);
    setTotalPaid(0);
    setIsSubmitting(false);
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
    try {
      // In a real application, we would upload the file to storage
      // For now, we'll just create a local URL
      const receiptUrl = URL.createObjectURL(file);
      
      handlePaymentChange(id, 'receiptUrl', receiptUrl);
      toast.success(`Receipt uploaded for payment`);
    } catch (error) {
      console.error("Failed to upload receipt:", error);
      toast.error("Failed to upload receipt");
    }
  }, [handlePaymentChange]);

  const handleSubmit = useCallback(() => {
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
      
      // Call the parent handler with a small delay to allow state to settle
      setTimeout(() => {
        onMarkAsPaid(invoiceId, paymentRecords);
        onOpenChange(false);
        
        // Wait a bit before clearing state to avoid UI glitches
        setTimeout(() => {
          setIsSubmitting(false);
        }, 200);
      }, 200);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to mark invoice as paid");
      setIsSubmitting(false);
    }
  }, [invoiceId, invoiceAmount, payments, totalPaid, onMarkAsPaid, onOpenChange]);

  return {
    payments,
    totalPaid,
    isSubmitting,
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleFileUpload,
    handleSubmit,
    resetState
  };
};
