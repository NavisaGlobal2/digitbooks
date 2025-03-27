
import React from "react";
import { Button } from "@/components/ui/button";
import { BusinessProfileProvider } from "./business/BusinessProfileContext";
import { CompanyProfileCard } from "./business/CompanyProfileCard";
import { ContactInfoCard } from "./business/ContactInfoCard";
import { AddressCard } from "./business/AddressCard";
import { useBusinessProfile } from "./business/BusinessProfileContext";

// This component wraps the form with the provider
export const BusinessProfileSettings = () => {
  return (
    <BusinessProfileProvider>
      <BusinessProfileForm />
    </BusinessProfileProvider>
  );
};

// This is the actual form component that uses the context
const BusinessProfileForm = () => {
  const { handleSubmit, isLoading } = useBusinessProfile();

  return (
    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
      <CompanyProfileCard />
      <ContactInfoCard />
      <AddressCard />
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="px-6"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
