
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Revenue } from "@/types/revenue";
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

interface RevenueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<Revenue, "id">) => void;
  defaultValues?: Partial<Revenue>;
  isEdit?: boolean;
}

const RevenueForm = ({ open, onOpenChange, onSubmit, defaultValues, isEdit = false }: RevenueFormProps) => {
  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      source: defaultValues?.source || "sales",
      paymentMethod: defaultValues?.paymentMethod || "bank transfer",
      paymentStatus: defaultValues?.paymentStatus || "paid",
      clientName: defaultValues?.clientName || "",
      notes: defaultValues?.notes || "",
    },
  });

  const handleSubmit = (values: RevenueFormValues) => {
    onSubmit({
      description: values.description,
      amount: values.amount,
      date: values.date,
      source: values.source,
      paymentMethod: values.paymentMethod,
      paymentStatus: values.paymentStatus,
      clientName: values.clientName || undefined,
      notes: values.notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <RevenueDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit revenue" : "New revenue"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <RevenueSourceField control={form.control} />
          <RevenueDescriptionField control={form.control} />
          <RevenueAmountField control={form.control} />
          <RevenueDateField control={form.control} />
          <RevenuePaymentStatusField control={form.control} />
          <RevenuePaymentMethodField control={form.control} />
          <RevenueClientNameField control={form.control} />
          <RevenueNotesField control={form.control} />
          
          <div className="pt-4">
            <RevenueFormActions onCancel={() => onOpenChange(false)} isEdit={isEdit} />
          </div>
        </form>
      </Form>
    </RevenueDialog>
  );
};

export default RevenueForm;
