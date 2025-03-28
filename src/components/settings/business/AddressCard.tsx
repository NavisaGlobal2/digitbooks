
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useBusinessProfile } from "./BusinessProfileContext";

export const AddressCard: React.FC = () => {
  const { profile, handleChange } = useBusinessProfile();

  return (
    <Card>
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <CardTitle className="text-base sm:text-lg">Business Address</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Your official business address for invoices and communications
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:gap-6 px-4 sm:px-6">
        <div className="grid gap-3 sm:gap-4">
          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="address.line1" className="text-xs">Address Line 1</Label>
            <Input 
              id="address.line1" 
              name="address.line1" 
              value={profile.address.line1} 
              onChange={handleChange} 
              className="text-sm"
            />
          </div>
          
          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="address.line2" className="text-xs">Address Line 2</Label>
            <Input 
              id="address.line2" 
              name="address.line2" 
              value={profile.address.line2} 
              onChange={handleChange} 
              className="text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="address.city" className="text-xs">City</Label>
              <Input 
                id="address.city" 
                name="address.city" 
                value={profile.address.city} 
                onChange={handleChange} 
                className="text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="address.state" className="text-xs">State/Province</Label>
              <Input 
                id="address.state" 
                name="address.state" 
                value={profile.address.state} 
                onChange={handleChange} 
                className="text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="address.postalCode" className="text-xs">Postal Code</Label>
              <Input 
                id="address.postalCode" 
                name="address.postalCode" 
                value={profile.address.postalCode} 
                onChange={handleChange} 
                className="text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="address.country" className="text-xs">Country</Label>
              <Input 
                id="address.country" 
                name="address.country" 
                value={profile.address.country} 
                onChange={handleChange} 
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
