
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface BusinessAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BusinessProfile {
  name: string;
  description: string;
  logo: string;
  email: string;
  phone: string;
  website: string;
  address: BusinessAddress;
}

interface BusinessProfileContextType {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const defaultProfile: BusinessProfile = {
  name: "DigitBooks Solutions",
  description: "Financial software and bookkeeping services",
  logo: "",
  email: "contact@digitbooks.example.com",
  phone: "+1 (555) 123-4567",
  website: "https://digitbooks.example.com",
  address: {
    line1: "123 Business Avenue",
    line2: "Suite 405",
    city: "San Francisco",
    state: "CA",
    postalCode: "94103",
    country: "United States"
  }
};

export const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const BusinessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch profile data from Supabase when component mounts
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching business profile:", error);
          toast.error("Failed to load business profile");
          return;
        }
        
        if (data) {
          console.log("Retrieved profile data:", data);
          
          // Parse address components from the address string if available
          const addressParts = parseAddressString(data.address || "");
          
          // Map database fields to our profile structure
          setProfile({
            name: data.business_name || defaultProfile.name,
            description: data.industry || defaultProfile.description,
            logo: "", // We don't store this yet
            email: user.email || defaultProfile.email, // Use email from auth user instead of profile
            phone: data.phone || defaultProfile.phone,
            website: data.website || defaultProfile.website,
            address: {
              line1: addressParts.line1 || defaultProfile.address.line1,
              line2: addressParts.line2 || defaultProfile.address.line2,
              city: addressParts.city || defaultProfile.address.city,
              state: addressParts.state || defaultProfile.address.state,
              postalCode: addressParts.postalCode || defaultProfile.address.postalCode,
              country: addressParts.country || defaultProfile.address.country
            }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load business profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user]);

  // Helper function to parse address string into components
  const parseAddressString = (addressString: string): Partial<BusinessAddress> => {
    // Very simple parsing logic - in a real app this would be more sophisticated
    const parts = addressString.split(',').map(part => part.trim());
    
    return {
      line1: parts[0] || '',
      line2: parts.length > 4 ? parts[1] : '',
      city: parts.length > 4 ? parts[2] : (parts.length > 1 ? parts[1] : ''),
      state: parts.length > 4 ? parts[3] : (parts.length > 2 ? parts[2] : ''),
      postalCode: parts.length > 4 ? parts[4] : (parts.length > 3 ? parts[3] : ''),
      country: parts.length > 5 ? parts[5] : (parts.length > 4 ? parts[4] : '')
    };
  };

  // Helper function to format address components into a single string for storage
  const formatAddressString = (address: BusinessAddress): string => {
    // Format address components into a single string for storage
    let addressString = address.line1;
    
    if (address.line2) {
      addressString += `, ${address.line2}`;
    }
    
    addressString += `, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;
    
    return addressString;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Saving profile to database:", profile);
      
      // Format address for storage
      const formattedAddress = formatAddressString(profile.address);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: profile.name,
          industry: profile.description,
          phone: profile.phone,
          website: profile.website,
          address: formattedAddress
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating business profile:", error);
        toast.error("Failed to update business profile");
        return;
      }
      
      toast.success("Business profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update business profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BusinessProfileContext.Provider value={{ profile, setProfile, handleChange, handleSubmit, isLoading }}>
      {children}
    </BusinessProfileContext.Provider>
  );
};

export const useBusinessProfile = () => {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error("useBusinessProfile must be used within a BusinessProfileProvider");
  }
  return context;
};
