
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransactionFrequency } from "@/types/recurringTransaction";
import { billFormSchema, BillFormValues } from "./BillFormSchema";

interface UseBillFormProps {
  onBillAdded: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useBillForm = ({ onBillAdded, onOpenChange }: UseBillFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category_id: "",
      frequency: "monthly",
      start_date: new Date(),
    },
  });

  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);

    try {
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Set the next_due_date to the start_date initially
      const next_due_date = values.start_date;
      
      const { error } = await supabase
        .from("recurring_transactions")
        .insert({
          description: values.description,
          amount: parseFloat(values.amount),
          category_id: values.category_id,
          frequency: values.frequency as TransactionFrequency,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date ? values.end_date.toISOString() : null,
          next_due_date: next_due_date.toISOString(),
          transaction_type: "expense",
          status: "active",
          user_id: userData.user.id,
        });

      if (error) {
        throw error;
      }

      toast.success("Bill created");
      form.reset();
      onBillAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit
  };
};
