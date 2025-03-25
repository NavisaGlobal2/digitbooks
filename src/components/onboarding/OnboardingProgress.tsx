
import React from "react";

interface OnboardingProgressProps {
  currentStep: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const totalSteps = 4;
  
  return (
    <div className="w-full mb-6">
      <div className="h-1 bg-white/30 rounded-full w-full">
        <div 
          className="h-1 bg-white rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-white/70 text-xs">
        <span>Start</span>
        <span>Complete</span>
      </div>
    </div>
  );
};
