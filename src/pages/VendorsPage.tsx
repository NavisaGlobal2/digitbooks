
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Upload, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import VendorsContent from "@/components/vendors/VendorsContent";
import AddVendorDialog from "@/components/vendors/AddVendorDialog";

const VendorsPage = () => {
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const navigate = useNavigate();
  
  const handleAddVendor = () => {
    setShowVendorDialog(true);
  };
  
  const handleBackClick = () => {
    navigate('/vendors');
  };
  
  return (
    <DashboardContainer>
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">Vendor Management</h1>
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
              onClick={handleAddVendor}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add vendor</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<VendorsContent onAddVendor={handleAddVendor} />} />
          <Route path="/:vendorName" element={<VendorsContent onAddVendor={handleAddVendor} />} />
        </Routes>
      </main>
      
      {/* Add Vendor Dialog */}
      <AddVendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
      />
    </DashboardContainer>
  );
};

export default VendorsPage;
