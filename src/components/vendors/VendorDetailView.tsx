
import { useState } from "react";
import { useVendors } from "@/contexts/VendorContext";
import { ArrowLeft, Building, Mail, Phone, Globe, Calendar, PieChart, MapPin, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorDetailViewProps {
  vendorId: string;
  onBack: () => void;
}

const VendorDetailView = ({ vendorId, onBack }: VendorDetailViewProps) => {
  const { getVendorById } = useVendors();
  const [activeTab, setActiveTab] = useState("overview");
  
  const vendor = getVendorById(vendorId);
  
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-gray-500">Vendor not found.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{vendor.name}</h1>
            <p className="text-sm text-gray-500">{vendor.category || "No category"}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            Edit Vendor
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
            Delete
          </Button>
        </div>
      </div>
      
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vendor Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{vendor.name}</p>
                </div>
              </div>
              
              {vendor.email && (
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{vendor.email}</p>
                  </div>
                </div>
              )}
              
              {vendor.phone && (
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{vendor.phone}</p>
                  </div>
                </div>
              )}
              
              {vendor.website && (
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-medium">{vendor.website}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {vendor.address && (
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{vendor.address}</p>
                  </div>
                </div>
              )}
              
              {vendor.contactPerson && (
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{vendor.contactPerson}</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="font-medium">{formatNaira(vendor.totalSpent)}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Transaction</p>
                  <p className="font-medium">
                    {vendor.lastTransaction 
                      ? new Date(vendor.lastTransaction).toLocaleDateString() 
                      : "No transactions yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {vendor.notes && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{vendor.notes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Vendor activity summary will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Transactions with this vendor will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Documents related to this vendor will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetailView;
