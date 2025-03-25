
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import OnboardingSteps from "@/components/onboarding/refactored/OnboardingSteps";
import OnboardingProgress from "@/components/onboarding/refactored/OnboardingProgress";
import WelcomeStep from "@/components/onboarding/refactored/steps/WelcomeStep";
import BusinessInfoStep from "@/components/onboarding/refactored/steps/BusinessInfoStep";
import LegalInfoStep from "@/components/onboarding/refactored/steps/LegalInfoStep";
import FeaturesStep from "@/components/onboarding/refactored/steps/FeaturesStep";
import BankConnectionStep from "@/components/onboarding/refactored/steps/BankConnectionStep";
import { STEPS, BUSINESS_TYPES, INDUSTRIES } from "@/components/onboarding/refactored/OnboardingConstants";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
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
    if (currentStep === STEPS.length - 1) {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;

      case 1:
        return (
          <BusinessInfoStep 
            businessInfo={businessInfo} 
            onBusinessInfoChange={setBusinessInfo} 
            businessTypes={BUSINESS_TYPES} 
            industries={INDUSTRIES} 
            onNext={handleNext} 
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
            selectedFeatures={selectedFeatures} 
            onFeaturesChange={setSelectedFeatures} 
            onNext={handleNext} 
          />
        );

      case 4:
        return (
          <BankConnectionStep 
            onSkip={() => navigate("/dashboard")} 
            onNext={handleNext} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white flex items-center justify-center p-3 sm:p-4 md:p-6 onboarding-container">
      <div className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl onboarding-content">
        <OnboardingProgress steps={STEPS} currentStep={currentStep} />
        <OnboardingSteps>
          {renderStepContent()}
        </OnboardingSteps>
      </div>
    </div>
  );
};

export default Onboarding;
