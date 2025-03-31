
import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorEmptyStateProps {
  onAddVendor: () => void;
}

const VendorEmptyState: React.FC<VendorEmptyStateProps> = ({ onAddVendor }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
      <div className="p-4 bg-green-50 rounded-full mb-4">
        <Building2 className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No vendors yet</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        Vendors help you track and manage businesses you purchase from. Add your first vendor to get started.
      </p>
      <Button onClick={onAddVendor} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Vendor
      </Button>
    </div>
  );
};

export default VendorEmptyState;
