
import React from "react";
import { OnboardingStep } from "@/types/onboarding";
import { CheckCircle, Circle } from "lucide-react";

interface OnboardingStepIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
}

const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ 
  steps, 
  currentStep 
}) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-8 relative">
        {/* Progress bar */}
        <div className="absolute h-1 bg-border w-full top-1/2 transform -translate-y-1/2"></div>
        <div 
          className="absolute h-1 bg-primary transition-all duration-500 top-1/2 transform -translate-y-1/2"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Step indicators */}
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`relative z-10 flex flex-col items-center`}
          >
            <div className={`
              rounded-full transition-all duration-300
              ${index < currentStep 
                ? 'bg-primary text-white' 
                : index === currentStep 
                  ? 'bg-primary text-white animate-pulse' 
                  : 'bg-background border-2 border-muted text-muted-foreground'
              }
            `}>
              {index < currentStep ? (
                <CheckCircle className="h-8 w-8 p-1" />
              ) : (
                <Circle className="h-8 w-8 p-1" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground text-lg">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
