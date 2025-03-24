
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Components
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import BusinessInfoStep from "@/components/onboarding/BusinessInfoStep";
import LegalInfoStep from "@/components/onboarding/LegalInfoStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import BankConnectionStep from "@/components/onboarding/BankConnectionStep";

// Constants
import { BUSINESS_TYPES, INDUSTRIES, ONBOARDING_STEPS } from "@/components/onboarding/OnboardingConstants";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [businessInfo, setBusinessInfo] = useState({
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

  const [legalInfo, setLegalInfo] = useState({
    rcNumber: "", // Required
    taxId: "", // Optional
    vatNumber: "", // Optional
    registrationDate: "" // Optional
  });

  const [selectedFeatures, setSelectedFeatures] = useState({
    invoicing: true,
    expenses: true,
    banking: false,
    reports: false,
    budgeting: false,
    inventory: false
  });

  // Fetch existing profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          // If user already has a profile with required fields
          // Pre-fill the form with existing data
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
          
          // If user has completed all required fields before, redirect to dashboard
          if (user.onboardingCompleted) {
            navigate('/dashboard');
            return;
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

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!businessInfo.name || !businessInfo.type || !businessInfo.industry) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    if (currentStep === 2) {
      // Only RC Number is required
      if (!legalInfo.rcNumber) {
        toast.error("Please provide your RC Number");
        return;
      }
    }

    // If this is the final step
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      try {
        // Save business profile to Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            business_name: businessInfo.name,
            industry: businessInfo.industry,
            tax_number: legalInfo.taxId || null, // Optional
            rc_number: legalInfo.rcNumber, // Required
            business_type: businessInfo.type,
            registration_date: legalInfo.registrationDate || null, // Optional
            vat_number: legalInfo.vatNumber || null, // Optional
            phone: businessInfo.phone,
            website: businessInfo.website,
            address: businessInfo.address
          });

        if (error) throw error;

        // Mark onboarding as completed
        completeOnboarding();
        
        toast.success("Setup completed! Welcome to DigiBooks");
        navigate("/dashboard");
      } catch (error) {
        console.error('Error saving profile:', error);
        toast.error("Failed to save business profile");
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    // When skipping, still mark onboarding as completed
    completeOnboarding();
    navigate("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;

      case 1:
        return (
          <BusinessInfoStep 
            businessInfo={businessInfo}
            onBusinessInfoChange={setBusinessInfo}
            onNext={handleNext}
            businessTypes={BUSINESS_TYPES}
            industries={INDUSTRIES}
          />
        );

      case 2:
        return (
          <LegalInfoStep 
            legalInfo={legalInfo}
            onLegalInfoChange={setLegalInfo}
            onNext={handleNext}
          />
        );

      case 3:
        return (
          <FeaturesStep 
            features={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
            onNext={handleNext}
          />
        );

      case 4:
        return (
          <BankConnectionStep 
            onSkip={handleSkip}
            onNext={handleNext}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <OnboardingStepIndicator 
            steps={ONBOARDING_STEPS}
            currentStep={currentStep}
          />

          {renderStepContent()}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
