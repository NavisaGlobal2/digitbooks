
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOnboardingData } from "@/hooks/useOnboardingData";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth";

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
  console.log("Rendering OnboardingContainer");
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
  
  // Log initial state for debugging
  useEffect(() => {
    console.log("OnboardingContainer initial state:", { 
      user,
      isLoading,
      currentStep
    });
  }, []);

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (!isLoading && user?.onboardingCompleted) {
      console.log("User already completed onboarding, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  const handleNext = async () => {
    try {
      if (currentStep === ONBOARDING_STEPS.length - 1) {
        console.log("Saving profile from last step");
        const success = await saveProfile();
        if (success) {
          console.log("Profile saved successfully, marking onboarding as complete");
          await completeOnboarding(user);
          toast.success("Setup completed! Welcome to DigitBooks");
          navigate('/dashboard', { replace: true });
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      toast.error("An error occurred. Please try again.");
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
        await completeOnboarding(user);
        toast.success("Setup completed! Welcome to DigitBooks");
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || "Failed to complete onboarding");
    }
  };

  const renderStepContent = () => {
    console.log("Rendering step:", currentStep);
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-center text-lg font-medium text-gray-800 mb-4">
          Complete your DigiBooks setup
        </h2>
        
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
    </div>
  );
};

export default OnboardingContainer;
