
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Revenue } from "@/types/revenue";
import RevenueForm from "@/components/revenue/RevenueForm";

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Revenue</DialogTitle>
        </DialogHeader>
        <RevenueForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default AddRevenueDialog;
