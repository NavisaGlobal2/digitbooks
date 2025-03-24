
import { Revenue } from "@/types/revenue";
import RevenueForm from "@/components/revenue/RevenueForm";
import { useState } from "react";

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
    <RevenueForm 
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
};

export default AddRevenueDialog;
