
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Revenue, RevenueSource, PaymentMethod, PaymentStatus } from "@/types/revenue";
import { Form } from "@/components/ui/form";
import { RevenueDialog } from "./RevenueDialog";
import RevenueSourceField from "./form/RevenueSourceField";
import RevenueDescriptionField from "./form/RevenueDescriptionField";
import RevenueAmountField from "./form/RevenueAmountField";
import RevenueDateField from "./form/RevenueDateField";
import RevenuePaymentStatusField from "./form/RevenuePaymentStatusField";
import RevenuePaymentMethodField from "./form/RevenuePaymentMethodField";
import RevenueClientNameField from "./form/RevenueClientNameField";
import RevenueNotesField from "./form/RevenueNotesField";
import RevenueFormActions from "./form/RevenueFormActions";
import { revenueFormSchema, RevenueFormValues } from "./form/RevenueFormSchema";
import { useState } from "react";

interface RevenueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<Revenue, "id">) => void;
  defaultValues?: Partial<Revenue>;
  isEdit?: boolean;
}

const RevenueForm = ({ open, onOpenChange, onSubmit, defaultValues, isEdit = false }: RevenueFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      source: defaultValues?.source || "sales",
      payment_method: defaultValues?.payment_method || "bank transfer",
      payment_status: defaultValues?.payment_status || "paid",
      client_name: defaultValues?.client_name || "",
      notes: defaultValues?.notes || "",
    },
  });

  const handleSubmit = async (values: RevenueFormValues) => {
    try {
      setIsSubmitting(true);
      
      await onSubmit({
        description: values.description,
        amount: Number(values.amount),  // Ensure amount is converted to a number
        date: values.date,
        source: values.source as RevenueSource,
        payment_method: values.payment_method as PaymentMethod,
        payment_status: values.payment_status as PaymentStatus,
        client_name: values.client_name || undefined,
        notes: values.notes || undefined,
        revenue_number: defaultValues?.revenue_number,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting revenue form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RevenueDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit revenue" : "New revenue"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <RevenueSourceField control={form.control} />
          <RevenueDescriptionField control={form.control} />
          <RevenueAmountField control={form.control} />
          <RevenueDateField control={form.control} />
          <RevenuePaymentStatusField control={form.control} />
          <RevenuePaymentMethodField control={form.control} />
          <RevenueClientNameField control={form.control} />
          <RevenueNotesField control={form.control} />
          
          <div className="pt-3">
            <RevenueFormActions 
              onCancel={() => onOpenChange(false)} 
              isEdit={isEdit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </form>
      </Form>
    </RevenueDialog>
  );
};

export default RevenueForm;
