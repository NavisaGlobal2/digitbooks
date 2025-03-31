
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Mail, Phone, Globe, User } from 'lucide-react';
import { Vendor } from '@/contexts/vendor/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Edit</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <span className="sr-only">Delete</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          {vendor.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{vendor.email}</span>
            </div>
          )}
          
          {vendor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{vendor.phone}</span>
            </div>
          )}
          
          {vendor.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span>{vendor.website}</span>
            </div>
          )}
          
          {vendor.contactName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>{vendor.contactName}</span>
            </div>
          )}
          
          {vendor.address && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="line-clamp-1">{vendor.address}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          Added {formatDistanceToNow(vendor.createdAt, { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
