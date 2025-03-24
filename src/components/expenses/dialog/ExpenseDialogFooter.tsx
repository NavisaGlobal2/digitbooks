
import { Button } from "@/components/ui/button";

interface ExpenseDialogFooterProps {
  onSave: () => void;
  onCancel: () => void;
}

const ExpenseDialogFooter = ({ onSave, onCancel }: ExpenseDialogFooterProps) => {
  return (
    <div className="flex p-4 border-t space-x-3">
      <Button 
        className="flex-1 bg-green-500 hover:bg-green-600 text-white" 
        onClick={onSave}
      >
        Save expense
      </Button>
      <Button 
        className="flex-1" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default ExpenseDialogFooter;
