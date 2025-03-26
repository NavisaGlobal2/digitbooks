
import React from "react";
import { toast } from "sonner";
import { BusinessProfileProvider } from "./business/BusinessProfileContext";
import { CompanyProfileCard } from "./business/CompanyProfileCard";
import { ContactInfoCard } from "./business/ContactInfoCard";
import { AddressCard } from "./business/AddressCard";

export const BusinessProfileSettings = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be handled by the context's handleSubmit
  };

  return (
    <BusinessProfileProvider>
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <CompanyProfileCard />
        <ContactInfoCard />
        <AddressCard />
      </form>
    </BusinessProfileProvider>
  );
};
