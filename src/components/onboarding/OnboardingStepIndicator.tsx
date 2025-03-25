
import React from "react";
import { OnboardingStep } from "@/types/onboarding";

interface OnboardingStepIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
}

const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({ 
  steps, 
  currentStep 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4 relative">
        {/* Background line */}
        <div className="absolute h-[1px] bg-gray-200 w-full top-1/2"></div>
        
        {/* Progress line */}
        <div 
          className="absolute h-[1px] bg-[#05D166] top-1/2"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Step indicators */}
        {steps.map((step, index) => (
          <div 
            key={index}
            className="relative z-10 flex flex-col items-center"
          >
            <div className={`
              h-2 w-2 rounded-full 
              ${index <= currentStep ? 'bg-[#05D166]' : 'bg-gray-200'}
            `}></div>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-4">
        <h2 className="text-base font-medium mb-1">{steps[currentStep].title}</h2>
        <p className="text-gray-500 text-xs">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
