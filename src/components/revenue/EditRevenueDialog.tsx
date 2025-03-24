
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Revenue } from "@/types/revenue";
import RevenueForm from "@/components/revenue/RevenueForm";
import { useRevenue } from "@/contexts/RevenueContext";

interface EditRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueId: string | null;
}

const EditRevenueDialog = ({ open, onOpenChange, revenueId }: EditRevenueDialogProps) => {
  const { revenues, updateRevenue } = useRevenue();
  
  const revenue = revenues.find(r => r.id === revenueId);
  
  const handleSubmit = (values: Omit<Revenue, "id">) => {
    if (revenueId) {
      updateRevenue(revenueId, values);
      onOpenChange(false);
    }
  };

  if (!revenue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Revenue</DialogTitle>
        </DialogHeader>
        <RevenueForm 
          onSubmit={handleSubmit} 
          defaultValues={revenue}
          isEdit
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditRevenueDialog;
