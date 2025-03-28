
import { Building, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorsEmptyStateProps {
  onAddVendor: () => void;
}

const VendorsEmptyState = ({ onAddVendor }: VendorsEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Building className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No vendors yet</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Start adding vendors to keep track of your business relationships and expenses.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onAddVendor} 
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Vendor
        </Button>
      </div>
    </div>
  );
};

export default VendorsEmptyState;
