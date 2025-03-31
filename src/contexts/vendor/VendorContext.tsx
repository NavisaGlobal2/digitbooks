
import React, { createContext, useContext } from "react";
import { VendorContextType, VendorProviderProps } from "./types";

// Create the context with a default undefined value
const VendorContext = createContext<VendorContextType | undefined>(undefined);

// Export the context for direct usage if needed
export { VendorContext };

// Export the useVendors hook for convenient access to the context
export const useVendors = (): VendorContextType => {
  const context = useContext(VendorContext);
  
  if (context === undefined) {
    throw new Error("useVendors must be used within a VendorProvider");
  }
  
  return context;
};
