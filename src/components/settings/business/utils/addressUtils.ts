
import { BusinessAddress } from "../types";

// Helper function to parse address string into components
export const parseAddressString = (addressString: string): Partial<BusinessAddress> => {
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
export const formatAddressString = (address: BusinessAddress): string => {
  // Format address components into a single string for storage
  let addressString = address.line1;
  
  if (address.line2) {
    addressString += `, ${address.line2}`;
  }
  
  addressString += `, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;
  
  return addressString;
};
