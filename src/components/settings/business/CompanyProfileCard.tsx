
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useBusinessProfile } from "./BusinessProfileContext";

export const CompanyProfileCard: React.FC = () => {
  const { profile, handleChange } = useBusinessProfile();

  return (
    <Card>
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Company Profile</CardTitle>
        <CardDescription className="text-xs">
          Update your business information and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex flex-col items-center space-y-3 mb-4 sm:mb-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={profile.logo} />
              <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              Change Logo
            </Button>
          </div>
          
          <div className="flex-1 grid gap-3 sm:gap-4">
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="name" className="text-xs">Business Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={profile.name} 
                onChange={handleChange} 
                className="text-sm"
              />
            </div>
            
            <div className="grid gap-1 sm:gap-2">
              <Label htmlFor="description" className="text-xs">Business Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={profile.description} 
                onChange={handleChange} 
                rows={3} 
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
