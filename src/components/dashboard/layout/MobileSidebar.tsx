
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/dashboard/Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-base sm:text-lg font-semibold">Menu</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={onClose}
            aria-label="Close mobile menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pb-safe">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
