
import { Building, Mail, Phone, Globe, Calendar, PieChart, MapPin, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import VendorInfoItem from "./VendorInfoItem";

interface VendorOverviewCardProps {
  vendor: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    contactPerson?: string;
    notes?: string;
    totalSpent: number;
    lastTransaction?: Date;
  };
}

const VendorOverviewCard = ({ vendor }: VendorOverviewCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Vendor Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <VendorInfoItem
              icon={Building}
              label="Company Name"
              value={vendor.name}
              iconColorClass="text-green-600"
            />
            
            {vendor.email && (
              <VendorInfoItem
                icon={Mail}
                label="Email"
                value={vendor.email}
                iconColorClass="text-blue-600"
              />
            )}
            
            {vendor.phone && (
              <VendorInfoItem
                icon={Phone}
                label="Phone"
                value={vendor.phone}
                iconColorClass="text-purple-600"
              />
            )}
            
            {vendor.website && (
              <VendorInfoItem
                icon={Globe}
                label="Website"
                value={vendor.website}
                iconColorClass="text-yellow-600"
              />
            )}
          </div>
          
          <div className="space-y-4">
            {vendor.address && (
              <VendorInfoItem
                icon={MapPin}
                label="Address"
                value={vendor.address}
                iconColorClass="text-orange-600"
              />
            )}
            
            {vendor.contactPerson && (
              <VendorInfoItem
                icon={User}
                label="Contact Person"
                value={vendor.contactPerson}
                iconColorClass="text-teal-600"
              />
            )}
            
            <VendorInfoItem
              icon={PieChart}
              label="Total Spent"
              value={formatNaira(vendor.totalSpent)}
              iconColorClass="text-green-600"
            />
            
            <VendorInfoItem
              icon={Calendar}
              label="Last Transaction"
              value={vendor.lastTransaction 
                ? new Date(vendor.lastTransaction).toLocaleDateString() 
                : "No transactions yet"}
              iconColorClass="text-blue-600"
            />
          </div>
        </div>
        
        {vendor.notes && (
          <div className="mt-6 pt-6 border-t">
            <VendorInfoItem
              icon={FileText}
              label="Notes"
              value={vendor.notes}
              iconColorClass="text-gray-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOverviewCard;
