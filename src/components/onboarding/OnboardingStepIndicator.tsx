
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
      <div className="flex justify-between items-center mb-6 relative">
        {/* Simple line background */}
        <div className="absolute h-px bg-gray-200 w-full top-1/2"></div>
        
        {/* Simple progress line */}
        <div 
          className="absolute h-px bg-black top-1/2"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Minimalist step indicators */}
        {steps.map((step, index) => (
          <div 
            key={index}
            className="relative z-10 flex flex-col items-center"
          >
            <div className={`
              h-3 w-3 rounded-full 
              ${index <= currentStep ? 'bg-black' : 'bg-gray-200'}
            `}></div>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium mb-1">{steps[currentStep].title}</h2>
        <p className="text-gray-500 text-sm">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
