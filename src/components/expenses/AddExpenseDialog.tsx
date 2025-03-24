
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useExpenseDialog } from "@/hooks/useExpenseDialog";
import ExpenseDialogHeader from "./dialog/ExpenseDialogHeader";
import ExpenseDialogForm from "./dialog/ExpenseDialogForm";
import ExpenseDialogFooter from "./dialog/ExpenseDialogFooter";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const {
    description,
    setDescription,
    amount,
    setAmount,
    date,
    setDate,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    receiptFile,
    setReceiptFile,
    handleClose,
    handleSave
  } = useExpenseDialog(() => onOpenChange(false));
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <ExpenseDialogHeader onClose={handleClose} />
        
        <ExpenseDialogForm
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          category={category}
          setCategory={setCategory}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          receiptFile={receiptFile}
          setReceiptFile={setReceiptFile}
        />
        
        <ExpenseDialogFooter 
          onSave={handleSave} 
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
