
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBusinessProfile } from "./BusinessProfileContext";

export const ContactInfoCard: React.FC = () => {
  const { profile, handleChange } = useBusinessProfile();

  return (
    <Card>
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Contact Information</CardTitle>
        <CardDescription className="text-xs">
          How clients and partners can reach your business
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="email" className="text-xs">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={profile.email} 
              onChange={handleChange} 
              className="text-sm"
            />
          </div>
          
          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={profile.phone} 
              onChange={handleChange} 
              className="text-sm"
            />
          </div>
          
          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="website" className="text-xs">Website</Label>
            <Input 
              id="website" 
              name="website" 
              value={profile.website} 
              onChange={handleChange} 
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
