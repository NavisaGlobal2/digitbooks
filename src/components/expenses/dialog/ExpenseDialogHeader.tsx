
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ExpenseDialogHeaderProps {
  onClose: () => void;
}

const ExpenseDialogHeader = ({ onClose }: ExpenseDialogHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <DialogTitle className="text-xl font-medium">Add expense</DialogTitle>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ExpenseDialogHeader;
