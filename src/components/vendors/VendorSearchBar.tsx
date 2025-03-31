
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VendorSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddVendor: () => void;
}

const VendorSearchBar: React.FC<VendorSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddVendor,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <Button onClick={onAddVendor} className="gap-2 whitespace-nowrap">
        <Plus className="h-4 w-4" />
        Add Vendor
      </Button>
    </div>
  );
};

export default VendorSearchBar;
