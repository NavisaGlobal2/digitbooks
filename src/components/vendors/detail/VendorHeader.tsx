
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorHeaderProps {
  vendorName: string;
  vendorCategory?: string;
  onBack: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const VendorHeader = ({ 
  vendorName, 
  vendorCategory, 
  onBack, 
  onEditClick, 
  onDeleteClick 
}: VendorHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{vendorName}</h1>
          <p className="text-sm text-gray-500">{vendorCategory || "No category"}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEditClick}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
          onClick={onDeleteClick}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default VendorHeader;
