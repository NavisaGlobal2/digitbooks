
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
          // Map database fields to our profile structure
          setProfile({
            name: data.business_name || defaultProfile.name,
            description: data.industry || defaultProfile.description,
            logo: "", // We don't store this yet
            email: data.email || defaultProfile.email,
            phone: data.phone || defaultProfile.phone,
            website: data.website || defaultProfile.website,
            address: {
              line1: data.address || defaultProfile.address.line1,
              line2: defaultProfile.address.line2, // Not stored in DB yet
              city: data.city || defaultProfile.address.city,
              state: data.state || defaultProfile.address.state,
              postalCode: data.postal_code || defaultProfile.address.postalCode,
              country: data.country || defaultProfile.address.country
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
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: profile.name,
          industry: profile.description,
          phone: profile.phone,
          website: profile.website,
          email: profile.email,
          address: profile.address.line1,
          city: profile.address.city,
          state: profile.address.state,
          postal_code: profile.address.postalCode,
          country: profile.address.country
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
