
import React, { createContext, useState, useContext } from "react";
import { toast } from "sonner";

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
    
    // Show success message using toast
    toast.success("Business profile updated successfully");
  };

  return (
    <BusinessProfileContext.Provider value={{ profile, setProfile, handleChange, handleSubmit }}>
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
