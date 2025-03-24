
import { useRevenue } from "@/contexts/RevenueContext";
import { Revenue } from "@/types/revenue";
import RevenueForm from "@/components/revenue/RevenueForm";
import { toast } from "sonner";

interface EditRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueId: string | null;
}

const EditRevenueDialog = ({ open, onOpenChange, revenueId }: EditRevenueDialogProps) => {
  const { revenues, updateRevenue } = useRevenue();
  
  const revenue = revenueId ? revenues.find(rev => rev.id === revenueId) : null;
  
  const handleSubmit = (values: Omit<Revenue, "id">) => {
    if (revenueId) {
      updateRevenue(revenueId, values);
      toast.success("Revenue updated successfully");
    }
  };
  
  if (!revenue) return null;
  
  return (
    <RevenueForm
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      defaultValues={revenue}
      isEdit={true}
    />
  );
};

export default EditRevenueDialog;
