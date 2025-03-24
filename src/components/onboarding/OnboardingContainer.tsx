
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOnboardingData } from "@/hooks/useOnboardingData";
import { ChevronLeft } from "lucide-react";

// Components
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import BusinessInfoStep from "@/components/onboarding/BusinessInfoStep";
import LegalInfoStep from "@/components/onboarding/LegalInfoStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import BankConnectionStep from "@/components/onboarding/BankConnectionStep";

// Constants
import { BUSINESS_TYPES, INDUSTRIES, ONBOARDING_STEPS } from "@/components/onboarding/OnboardingConstants";

const OnboardingContainer = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    businessInfo,
    setBusinessInfo,
    legalInfo,
    setLegalInfo,
    selectedFeatures,
    setSelectedFeatures,
    isLoading,
    isSaving,
    saveProfile
  } = useOnboardingData();

  const handleNext = async () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      await saveProfile();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    try {
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || "Failed to complete onboarding");
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
            onNext={handleNext}
            onBack={handleBack}
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
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <FeaturesStep 
            features={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 4:
        return (
          <BankConnectionStep 
            onSkip={handleSkip}
            onNext={handleNext}
            onBack={handleBack}
            isSaving={isSaving}
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
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              className="flex items-center text-muted-foreground mb-4 hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          )}

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

export default OnboardingContainer;
