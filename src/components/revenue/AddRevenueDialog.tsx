
import { Revenue } from "@/types/revenue";
import RevenueForm from "@/components/revenue/RevenueForm";
import { DollarSign } from "lucide-react";

interface AddRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevenueAdded?: (revenue: Omit<Revenue, "id">) => void;
}

const AddRevenueDialog = ({ open, onOpenChange, onRevenueAdded }: AddRevenueDialogProps) => {
  const handleSubmit = (values: Omit<Revenue, "id">) => {
    if (onRevenueAdded) {
      onRevenueAdded(values);
    }
  };

  return (
    <div>
      <div className="hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 rounded-full p-6 z-10">
        <DollarSign className="h-8 w-8 text-green-500" />
      </div>
      <RevenueForm 
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddRevenueDialog;
