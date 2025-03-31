
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorEmptyStateProps {
  onAddVendor: () => void;
}

const VendorEmptyState = ({ onAddVendor }: VendorEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <PlusCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No vendors added yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Keep track of your vendors by adding them to your vendor list. This will help you manage your expenses better.
      </p>
      <Button onClick={onAddVendor}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Your First Vendor
      </Button>
    </div>
  );
};

export default VendorEmptyState;
