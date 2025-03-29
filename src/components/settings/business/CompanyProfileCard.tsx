
import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "./BusinessProfileContext";
import LogoUpload from "@/components/invoicing/LogoUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const CompanyProfileCard: React.FC = () => {
  const { profile, handleChange, setProfile } = useBusinessProfile();
  const { user } = useAuth();

  // Fetch business profile logo on component mount
  useEffect(() => {
    const fetchBusinessLogo = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('logo_url')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching business logo:', error);
          return;
        }
        
        if (data && data.logo_url && !profile.logo) {
          setProfile(prev => ({
            ...prev,
            logo: data.logo_url
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    if (!profile.logo) {
      fetchBusinessLogo();
    }
  }, [user, profile.logo, setProfile]);

  const handleLogoChange = (logoUrl: string | null) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      logo: logoUrl || ""
    }));
  };

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
            <LogoUpload 
              logoPreview={profile.logo} 
              setLogoPreview={handleLogoChange} 
            />
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
