
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Building2, MapPin } from "lucide-react";
import { useState } from "react";

interface BusinessProfile {
  name: string;
  description: string;
  logo: string;
  email: string;
  phone: string;
  website: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const BusinessProfileSettings = () => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "DigiBooks Solutions",
    description: "Financial software and bookkeeping services",
    logo: "",
    email: "contact@digibooks.example.com",
    phone: "+1 (555) 123-4567",
    website: "https://digibooks.example.com",
    address: {
      line1: "123 Business Avenue",
      line2: "Suite 405",
      city: "San Francisco",
      state: "CA",
      postalCode: "94103",
      country: "United States"
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile({
        ...profile,
        address: {
          ...profile.address,
          [addressField]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data to database or context
    console.log("Profile saved:", profile);
    // Show success message
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>
              Update your business information and branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.logo} />
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  Change Logo
                </Button>
              </div>
              
              <div className="flex-1 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={profile.description} 
                    onChange={handleChange} 
                    rows={3} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How clients and partners can reach your business
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profile.email} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  value={profile.website} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Business Address</CardTitle>
            </div>
            <CardDescription>
              Your official business address for invoices and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address.line1">Address Line 1</Label>
                <Input 
                  id="address.line1" 
                  name="address.line1" 
                  value={profile.address.line1} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address.line2">Address Line 2</Label>
                <Input 
                  id="address.line2" 
                  name="address.line2" 
                  value={profile.address.line2} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address.city">City</Label>
                  <Input 
                    id="address.city" 
                    name="address.city" 
                    value={profile.address.city} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address.state">State/Province</Label>
                  <Input 
                    id="address.state" 
                    name="address.state" 
                    value={profile.address.state} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address.postalCode">Postal Code</Label>
                  <Input 
                    id="address.postalCode" 
                    name="address.postalCode" 
                    value={profile.address.postalCode} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address.country">Country</Label>
                  <Input 
                    id="address.country" 
                    name="address.country" 
                    value={profile.address.country} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-4 w-full">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};
