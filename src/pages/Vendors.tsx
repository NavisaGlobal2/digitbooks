
import { useState } from "react";
import { useVendors } from "@/contexts/vendor";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import VendorsContent from "@/components/vendors/VendorsContent";

const VendorsPage = () => {
  return (
    <DashboardContainer>
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          </div>
        </div>
      </header>
      
      <main className="p-4 sm:p-6">
        <VendorsContent />
      </main>
    </DashboardContainer>
  );
};

export default VendorsPage;
