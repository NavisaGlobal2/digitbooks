
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { useTransactionForm } from "./hooks/useTransactionForm";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransactionDialog = ({
  open,
  onOpenChange,
}: AddTransactionDialogProps) => {
  const {
    formData,
    isSubmitting,
    categories,
    handleChange,
    handleSubmit,
    resetForm,
  } = useTransactionForm({
    onClose: () => onOpenChange(false),
  });

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        
        <TransactionForm 
          formTitle="Add New Transaction"
          submitButtonText="Add Transaction"
          isSubmitting={isSubmitting}
          date={formData.date}
          description={formData.description}
          amount={formData.amount}
          category={formData.category}
          type={formData.type}
          categories={categories}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      </DialogContent>
    </Dialog>
  );
};
