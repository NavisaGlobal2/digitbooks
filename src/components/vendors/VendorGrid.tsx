
import React from 'react';
import { Vendor } from '@/contexts/vendor/types';
import VendorCard from './VendorCard';

interface VendorGridProps {
  vendors: Vendor[];
  onEditVendor: (id: string) => void;
  onDeleteVendor: (id: string) => void;
}

const VendorGrid: React.FC<VendorGridProps> = ({ vendors, onEditVendor, onDeleteVendor }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          onEdit={() => onEditVendor(vendor.id)}
          onDelete={() => onDeleteVendor(vendor.id)}
        />
      ))}
    </div>
  );
};

export default VendorGrid;
