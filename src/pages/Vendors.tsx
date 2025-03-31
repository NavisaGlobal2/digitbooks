
import { useState } from "react";
import { useVendors } from "@/contexts/vendor/VendorProvider";
import VendorsContent from "@/components/vendors/VendorsContent";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Plus } from "lucide-react";
import VendorDialog from "@/components/vendors/VendorDialog";

const VendorsPage = () => {
  const { vendors, addVendor, updateVendor } = useVendors();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  return (
    <DashboardContainer>
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">Vendors</h1>
          </div>
          
          <div className="flex items-center ml-auto gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-500"
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowAddDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add vendor</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-4 sm:p-6">
        <VendorsContent />
      </main>
      
      <VendorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={(vendorData) => {
          addVendor(vendorData);
          setShowAddDialog(false);
        }}
        vendor={undefined}
      />
    </DashboardContainer>
  );
};

export default VendorsPage;
