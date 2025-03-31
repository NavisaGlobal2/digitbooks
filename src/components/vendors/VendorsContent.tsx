
import React, { useState, useEffect } from 'react';
import { useVendors } from '@/contexts/vendor/VendorProvider';
import { Vendor } from '@/contexts/vendor/types';
import VendorEmptyState from './VendorEmptyState';
import VendorSearchBar from './VendorSearchBar';
import VendorGrid from './VendorGrid';
import VendorDialog from './VendorDialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const VendorsContent = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, getVendorById } = useVendors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>(vendors);
  
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | undefined>(undefined);
  
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filter vendors whenever search query or vendors list changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(query) ||
      (vendor.email && vendor.email.toLowerCase().includes(query)) ||
      (vendor.phone && vendor.phone.includes(query)) ||
      (vendor.contactName && vendor.contactName.toLowerCase().includes(query))
    );
    
    setFilteredVendors(filtered);
  }, [vendors, searchQuery]);
  
  const handleAddVendor = () => {
    setCurrentVendor(undefined);
    setShowVendorDialog(true);
  };
  
  const handleEditVendor = (id: string) => {
    const vendor = getVendorById(id);
    if (vendor) {
      setCurrentVendor(vendor);
      setShowVendorDialog(true);
    }
  };
  
  const handleDeleteVendor = (id: string) => {
    setDeleteVendorId(id);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteVendor = () => {
    if (deleteVendorId) {
      deleteVendor(deleteVendorId);
      toast.success("Vendor deleted successfully");
      setDeleteVendorId(null);
      setShowDeleteDialog(false);
    }
  };
  
  const handleSaveVendor = (vendorData: Omit<Vendor, 'id' | 'createdAt'>) => {
    if (currentVendor) {
      updateVendor(currentVendor.id, vendorData);
      toast.success("Vendor updated successfully");
    } else {
      addVendor(vendorData);
      toast.success("Vendor added successfully");
    }
  };
  
  if (vendors.length === 0) {
    return <VendorEmptyState onAddVendor={handleAddVendor} />;
  }
  
  return (
    <div className="space-y-6">
      <VendorSearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddVendor={handleAddVendor}
      />
      
      {filteredVendors.length > 0 ? (
        <VendorGrid 
          vendors={filteredVendors}
          onEditVendor={handleEditVendor}
          onDeleteVendor={handleDeleteVendor}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No vendors match your search criteria</p>
        </div>
      )}
      
      {/* Vendor Dialog for Add/Edit */}
      <VendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
        onSave={handleSaveVendor}
        vendor={currentVendor}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this vendor. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVendor} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorsContent;
