import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingLeftColumn } from "@/components/onboarding/OnboardingLeftColumn";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { BusinessInfoStep } from "@/components/onboarding/steps/BusinessInfoStep";
import { LegalInfoStep } from "@/components/onboarding/steps/LegalInfoStep";
import { FinalStep } from "@/components/onboarding/steps/FinalStep";
import { BUSINESS_TYPES, INDUSTRIES } from "@/components/onboarding/OnboardingConstants";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [businessInfo, setBusinessInfo] = useState({
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

  const [legalInfo, setLegalInfo] = useState({
    rcNumber: "",
    taxId: "",
    vatNumber: "",
    registrationDate: ""
  });

  const [selectedFeatures, setSelectedFeatures] = useState({
    invoicing: true,
    expenses: true,
    banking: false,
    reports: false,
    budgeting: false,
    inventory: false
  });

  const handleNext = async (): Promise<boolean> => {
    if (currentStep === 0 && !businessInfo.name) {
      return false;
    }

    if (currentStep === 1) {
      if (!businessInfo.industry) {
        return false;
      }
    }

    if (currentStep === 3) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            business_name: businessInfo.name,
            industry: businessInfo.industry,
            tax_number: legalInfo.taxId || null,
            rc_number: legalInfo.rcNumber || null,
            business_type: businessInfo.type,
            registration_date: legalInfo.registrationDate || null,
            vat_number: legalInfo.vatNumber || null,
            phone: businessInfo.phone,
            website: businessInfo.website,
            address: businessInfo.address,
            business_size: businessInfo.size
          });

        if (error) throw error;

        navigate("/dashboard");
        return true;
      } catch (error) {
        console.error('Error saving profile:', error);
        return false;
      }
    } else {
      setCurrentStep(currentStep + 1);
      return true;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep 
            businessInfo={businessInfo} 
            setBusinessInfo={setBusinessInfo} 
            handleNext={handleNext}
          />
        );
      case 1:
        return (
          <BusinessInfoStep 
            businessInfo={businessInfo} 
            setBusinessInfo={setBusinessInfo} 
            handleNext={handleNext}
            handleBack={handleBack}
            industries={INDUSTRIES}
          />
        );
      case 2:
        return (
          <LegalInfoStep 
            legalInfo={legalInfo} 
            setLegalInfo={setLegalInfo} 
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        );
      case 3:
        return (
          <FinalStep 
            businessInfo={businessInfo}
            legalInfo={legalInfo}
            handleNext={handleNext}
            handleBack={handleBack}
            industries={INDUSTRIES}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <OnboardingLeftColumn />
      <div className="w-full md:w-1/2 bg-[#05D166] flex flex-col justify-center">
        <div className="p-8 md:p-12 w-full h-full flex flex-col justify-center">
          <OnboardingProgress currentStep={currentStep} />
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
