
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { useTransactionForm } from "./hooks/useTransactionForm";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export const EditTransactionDialog = ({
  open,
  onOpenChange,
  transactionId,
}: EditTransactionDialogProps) => {
  const {
    formData,
    isSubmitting,
    categories,
    handleChange,
    handleSubmit,
    resetForm,
  } = useTransactionForm({
    transactionId,
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
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        
        <TransactionForm 
          formTitle="Edit Transaction"
          submitButtonText="Update Transaction"
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
