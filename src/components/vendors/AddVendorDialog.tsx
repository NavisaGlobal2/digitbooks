
import { useState } from "react";
import { toast } from "sonner";
import { useVendors } from "@/contexts/VendorContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VendorForm from "./VendorForm";

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddVendorDialog = ({ open, onOpenChange }: AddVendorDialogProps) => {
  const { addVendor } = useVendors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (formData: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    contactPerson?: string;
    category?: string;
    notes?: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      const result = await addVendor({
        ...formData
      });
      
      if (result) {
        onOpenChange(false);
        toast.success("Vendor added successfully");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      toast.error("Failed to add vendor");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Vendor</DialogTitle>
        </DialogHeader>
        
        <VendorForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorDialog;
