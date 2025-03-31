
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Vendor } from '@/contexts/vendor/types';

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (vendorData: Omit<Vendor, 'id' | 'createdAt'>) => void;
  vendor?: Vendor;
}

const VendorDialog: React.FC<VendorDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  vendor
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when dialog opens/closes or vendor changes
  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setAddress(vendor.address || '');
      setWebsite(vendor.website || '');
      setContactName(vendor.contactName || '');
      setNotes(vendor.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setWebsite('');
      setContactName('');
      setNotes('');
    }
  }, [vendor, open]);

  const handleSave = () => {
    if (!name.trim()) {
      // Could add more robust validation here
      return;
    }

    onSave({
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      website: website || undefined,
      contactName: contactName || undefined,
      notes: notes || undefined
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name *</Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vendor name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor-phone">Phone</Label>
              <Input
                id="vendor-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-website">Website</Label>
            <Input
              id="vendor-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter website"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-contact">Contact Person</Label>
            <Input
              id="vendor-contact"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact person name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-notes">Notes</Label>
            <Textarea
              id="vendor-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this vendor"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {vendor ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
