
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOnboardingData } from "@/hooks/useOnboardingData";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Components
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import BusinessInfoStep from "@/components/onboarding/BusinessInfoStep";
import LegalInfoStep from "@/components/onboarding/LegalInfoStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import BankConnectionStep from "@/components/onboarding/BankConnectionStep";
import { OnboardingLeftColumn } from "@/components/onboarding/OnboardingLeftColumn";

// Constants
import { BUSINESS_TYPES, INDUSTRIES, ONBOARDING_STEPS } from "@/components/onboarding/OnboardingConstants";

const OnboardingContainer = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { user, completeOnboarding } = useAuth();
  
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

  useEffect(() => {
    if (!isLoading && user?.onboardingCompleted) {
      console.log("User already completed onboarding, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  const handleNext = async () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      try {
        console.log("Saving profile from last step");
        const success = await saveProfile();
        if (success) {
          console.log("Profile saved successfully, marking onboarding as complete");
          completeOnboarding();
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile");
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      console.log("Saving profile from skip action");
      const success = await saveProfile();
      if (success) {
        console.log("Profile saved successfully from skip, marking onboarding as complete");
        completeOnboarding();
        navigate('/dashboard', { replace: true });
      }
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
    <div className="min-h-screen bg-white flex">
      {/* Left Column */}
      <OnboardingLeftColumn />
      
      {/* Right Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05D166]"></div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-500 mb-4 hover:text-black"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}

            <OnboardingStepIndicator 
              steps={ONBOARDING_STEPS}
              currentStep={currentStep}
            />

            <div className="min-h-[400px] flex items-center justify-center">
              {renderStepContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingContainer;
