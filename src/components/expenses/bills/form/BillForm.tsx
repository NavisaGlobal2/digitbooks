
import { Form } from "@/components/ui/form";
import { DescriptionField, AmountField, CategoryField, FrequencyField, DateField } from "./BillFormFields";
import BillFormActions from "./BillFormActions";
import { useBillForm } from "./useBillForm";
import { BillFormValues } from "./BillFormSchema";

interface BillFormProps {
  onBillAdded: () => void;
  onOpenChange: (open: boolean) => void;
}

const BillForm = ({ onBillAdded, onOpenChange }: BillFormProps) => {
  const { form, isSubmitting, onSubmit } = useBillForm({ 
    onBillAdded, 
    onOpenChange 
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DescriptionField />
        <AmountField />
        <CategoryField />
        <FrequencyField />
        <DateField name="start_date" label="Start Date" />
        <DateField name="end_date" label="End Date" optional />
        
        <BillFormActions 
          onCancel={() => onOpenChange(false)} 
          isSubmitting={isSubmitting} 
        />
      </form>
    </Form>
  );
};

export default BillForm;
