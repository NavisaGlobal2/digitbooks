
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BillForm from "./form/BillForm";

interface AddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBillAdded: () => void;
}

const AddBillDialog = ({ open, onOpenChange, onBillAdded }: AddBillDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Bill</DialogTitle>
        </DialogHeader>

        <BillForm onBillAdded={onBillAdded} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
};

export default AddBillDialog;
