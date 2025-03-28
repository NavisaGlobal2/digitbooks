
import { useState } from "react";
import { addDays, addMonths, addQuarters, addWeeks, addYears } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { TransactionFrequency } from "@/types/recurringTransaction";

export const useBillPayment = (
  billId: string,
  billTitle: string,
  amount: number,
  frequency: TransactionFrequency,
  onSuccess: () => void,
  onClose: (open: boolean) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateNextDate = (currentDate: Date, frequency: TransactionFrequency): Date => {
    switch (frequency) {
      case "daily":
        return addDays(currentDate, 1);
      case "weekly":
        return addWeeks(currentDate, 1);
      case "monthly":
        return addMonths(currentDate, 1);
      case "quarterly":
        return addQuarters(currentDate, 1);
      case "annually":
        return addYears(currentDate, 1);
      default:
        return addMonths(currentDate, 1); // Default to monthly
    }
  };

  const processBillPayment = async (values: PaymentMethodForm) => {
    setIsSubmitting(true);
    
    try {
      // Get the current transaction details
      const { data: transactionData, error: fetchError } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("id", billId)
        .single();
      
      if (fetchError || !transactionData) {
        throw new Error("Failed to fetch bill details");
      }
      
      // Calculate the next due date
      const currentDueDate = new Date(transactionData.next_due_date);
      const nextDueDate = calculateNextDate(currentDueDate, frequency);
      
      // Create a transaction record for the payment
      const { error: expenseError } = await supabase
        .from("expenses")
        .insert({
          description: `Payment for ${billTitle}`,
          amount: amount,
          date: new Date().toISOString(),
          category: transactionData.category_id,
          status: "paid",
          payment_method: values.method,
          vendor: billTitle,
          notes: values.reference ? `Reference: ${values.reference}` : "Bill payment",
          user_id: transactionData.user_id,
        });
      
      if (expenseError) {
        throw expenseError;
      }
      
      // Update the recurring transaction with the new next_due_date
      const { error: updateError } = await supabase
        .from("recurring_transactions")
        .update({
          next_due_date: nextDueDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", billId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Bill marked as paid");
      onSuccess();
      onClose(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    processBillPayment
  };
};
