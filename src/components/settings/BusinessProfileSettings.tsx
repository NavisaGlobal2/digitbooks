
import React from "react";
import { BusinessProfileProvider } from "./business/BusinessProfileContext";
import { CompanyProfileCard } from "./business/CompanyProfileCard";
import { ContactInfoCard } from "./business/ContactInfoCard";
import { AddressCard } from "./business/AddressCard";

export const BusinessProfileSettings = () => {
  return (
    <BusinessProfileProvider>
      <form className="space-y-4 sm:space-y-6">
        <CompanyProfileCard />
        <ContactInfoCard />
        <AddressCard />
      </form>
    </BusinessProfileProvider>
  );
};
