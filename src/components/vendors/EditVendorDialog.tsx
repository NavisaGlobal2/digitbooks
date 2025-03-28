
import { useState } from "react";
import { toast } from "sonner";
import { useVendors } from "@/contexts/VendorContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VendorForm from "./VendorForm";
import { Vendor } from "@/types/vendor";

interface EditVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor;
}

const EditVendorDialog = ({ open, onOpenChange, vendor }: EditVendorDialogProps) => {
  const { updateVendor } = useVendors();
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
      
      const updatedVendor: Vendor = {
        ...vendor,
        ...formData,
      };
      
      const result = await updateVendor(updatedVendor);
      
      if (result) {
        onOpenChange(false);
        toast.success("Vendor updated successfully");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast.error("Failed to update vendor");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Vendor</DialogTitle>
        </DialogHeader>
        
        <VendorForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          initialData={{
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            website: vendor.website,
            address: vendor.address,
            contactPerson: vendor.contactPerson,
            category: vendor.category,
            notes: vendor.notes
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditVendorDialog;
