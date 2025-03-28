
import { useState } from "react";
import { useVendors } from "@/contexts/VendorContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditVendorDialog from "../EditVendorDialog";
import DeleteVendorDialog from "../DeleteVendorDialog";
import VendorHeader from "./VendorHeader";
import VendorOverviewCard from "./VendorOverviewCard";
import VendorTabs from "./VendorTabs";

interface VendorDetailViewProps {
  vendorId: string;
  onBack: () => void;
}

const VendorDetailView = ({ vendorId, onBack }: VendorDetailViewProps) => {
  const { getVendorById } = useVendors();
  const { expenses } = useExpenses();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const vendor = getVendorById(vendorId);
  
  // Get vendor-related expenses
  const vendorExpenses = expenses.filter(
    expense => expense.vendor.toLowerCase() === (vendor?.name.toLowerCase() || '')
  );
  
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-gray-500">Vendor not found.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <VendorHeader 
        vendorName={vendor.name}
        vendorCategory={vendor.category}
        onBack={onBack}
        onEditClick={() => setShowEditDialog(true)}
        onDeleteClick={() => setShowDeleteDialog(true)}
      />
      
      {/* Overview Card */}
      <VendorOverviewCard vendor={vendor} />
      
      {/* Tabs */}
      <VendorTabs 
        vendorName={vendor.name}
        totalSpent={vendor.totalSpent}
        vendorExpenses={vendorExpenses}
      />
      
      {/* Edit Vendor Dialog */}
      {vendor && (
        <EditVendorDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          vendor={vendor}
        />
      )}
      
      {/* Delete Vendor Dialog */}
      <DeleteVendorDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        vendorId={vendor.id}
        vendorName={vendor.name}
        onSuccess={onBack}
      />
    </div>
  );
};

export default VendorDetailView;
