
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { BusinessInfo, LegalInfo, FeatureState } from "@/types/onboarding";

export const useOnboardingData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    type: "",
    industry: "",
    size: "1-5",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    phone: "",
    website: ""
  });

  const [legalInfo, setLegalInfo] = useState<LegalInfo>({
    rcNumber: "",
    taxId: "",
    vatNumber: "",
    registrationDate: ""
  });

  const [selectedFeatures, setSelectedFeatures] = useState<FeatureState>({
    invoicing: true,
    expenses: true,
    banking: false,
    reports: false,
    budgeting: false,
    inventory: false
  });

  // Memoize fetchExistingData to prevent unnecessary re-renders
  const fetchExistingData = useCallback(async () => {
    if (!user || dataFetched) {
      setIsLoading(false);
      return;
    }

    console.log("Fetching existing profile data for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile data:", error);
        throw error;
      }

      if (data) {
        console.log("Found existing profile data");
        // Update state with existing data
        setBusinessInfo(prev => ({
          ...prev,
          name: data.business_name || '',
          type: data.business_type || '',
          industry: data.industry || '',
          address: data.address || '',
          phone: data.phone || '',
          website: data.website || ''
        }));

        setLegalInfo(prev => ({
          ...prev,
          rcNumber: data.rc_number || '',
          taxId: data.tax_number || '',
          vatNumber: data.vat_number || '',
          registrationDate: data.registration_date || ''
        }));
      } else {
        console.log("No existing profile data found");
      }
      
      setDataFetched(true);
    } catch (error) {
      console.error("Error in fetchExistingData:", error);
      // Continue with empty form data
    } finally {
      setIsLoading(false);
    }
  }, [user, dataFetched]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const saveProfile = async (): Promise<boolean> => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    setIsSaving(true);
    console.log("Saving profile data for user:", user.id);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          business_name: businessInfo.name,
          business_type: businessInfo.type,
          industry: businessInfo.industry,
          address: businessInfo.address,
          phone: businessInfo.phone,
          website: businessInfo.website,
          rc_number: legalInfo.rcNumber,
          tax_number: legalInfo.taxId || null,
          vat_number: legalInfo.vatNumber || null,
          registration_date: legalInfo.registrationDate || null
        });

      if (error) throw error;
      
      console.log("Profile saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    businessInfo,
    setBusinessInfo,
    legalInfo,
    setLegalInfo,
    selectedFeatures,
    setSelectedFeatures,
    isLoading,
    isSaving,
    saveProfile
  };
};
