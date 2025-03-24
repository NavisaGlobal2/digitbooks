
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessInfo, LegalInfo, FeatureState } from "@/types/onboarding";

interface UseOnboardingDataReturn {
  businessInfo: BusinessInfo;
  setBusinessInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
  legalInfo: LegalInfo;
  setLegalInfo: React.Dispatch<React.SetStateAction<LegalInfo>>;
  selectedFeatures: FeatureState;
  setSelectedFeatures: React.Dispatch<React.SetStateAction<FeatureState>>;
  isLoading: boolean;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  saveProfile: () => Promise<boolean>;
}

export const useOnboardingData = (): UseOnboardingDataReturn => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    type: "",
    industry: "",
    size: "",
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching profile for user ID:", user.id);
        
        // First check if the profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setBusinessInfo({
            name: data.business_name || "",
            type: data.business_type || "",
            industry: data.industry || "",
            size: "",
            country: "Nigeria",
            state: "",
            city: "",
            address: data.address || "",
            phone: data.phone || "",
            website: data.website || ""
          });
          
          setLegalInfo({
            rcNumber: data.rc_number || "",
            taxId: data.tax_number || "",
            vatNumber: data.vat_number || "",
            registrationDate: data.registration_date ? new Date(data.registration_date).toISOString().split('T')[0] : ""
          });
          
          if (user.onboardingCompleted) {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const saveProfile = async (): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast.error("User ID is missing. Please try logging in again.");
        return false;
      }
      
      // Check if the user is authenticated in Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active Supabase session found");
        toast.error("Your session has expired. Please log in again.");
        return false;
      }
      
      setIsSaving(true);
      console.log("Saving profile for user ID:", user.id);
      console.log("Profile data being saved:", {
        id: user.id,
        business_name: businessInfo.name,
        industry: businessInfo.industry,
        tax_number: legalInfo.taxId || null,
        rc_number: legalInfo.rcNumber,
        business_type: businessInfo.type,
        registration_date: legalInfo.registrationDate || null,
        vat_number: legalInfo.vatNumber || null,
        phone: businessInfo.phone,
        website: businessInfo.website,
        address: businessInfo.address
      });
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          business_name: businessInfo.name,
          industry: businessInfo.industry,
          tax_number: legalInfo.taxId || null,
          rc_number: legalInfo.rcNumber,
          business_type: businessInfo.type,
          registration_date: legalInfo.registrationDate || null,
          vat_number: legalInfo.vatNumber || null,
          phone: businessInfo.phone,
          website: businessInfo.website,
          address: businessInfo.address
        })
        .select();

      if (error) {
        console.error('Error saving profile:', error);
        toast.error(error.message || "Failed to save business profile");
        return false;
      }

      console.log("Profile saved successfully:", data);
      completeOnboarding();
      
      toast.success("Setup completed! Welcome to DigiBooks");
      
      // Navigate to dashboard after successful save
      navigate("/dashboard", { replace: true });
      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Failed to save business profile");
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
    setIsSaving,
    saveProfile
  };
};
