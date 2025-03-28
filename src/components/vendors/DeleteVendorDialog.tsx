
import { useState } from "react";
import { toast } from "sonner";
import { useVendors } from "@/contexts/VendorContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";

interface DeleteVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
}

const DeleteVendorDialog = ({ open, onOpenChange, vendorId, vendorName, onSuccess }: DeleteVendorDialogProps) => {
  const { deleteVendor } = useVendors();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVendor = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteVendor(vendorId);
      
      if (success) {
        toast.success("Vendor deleted successfully");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Failed to delete vendor");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("An error occurred while deleting vendor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{vendorName}</span>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteVendor();
            }}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Deleting</span>
                <div className="animate-spin h-4 w-4 border-2 border-r-transparent rounded-full" />
              </>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Delete Vendor
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteVendorDialog;
