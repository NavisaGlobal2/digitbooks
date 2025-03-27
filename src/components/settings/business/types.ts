
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

export const defaultProfile: BusinessProfile = {
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
