
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExpenseFormActionsProps {
  onCancel: () => void;
}

const ExpenseFormActions = ({ onCancel }: ExpenseFormActionsProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" className="bg-[#05D166] hover:bg-[#05D166]/80 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Add Expense
      </Button>
    </div>
  );
};

export default ExpenseFormActions;
