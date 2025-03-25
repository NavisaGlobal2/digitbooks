
import React from "react";

interface Step {
  title: string;
  description: string;
}

interface OnboardingProgressProps {
  steps: Step[];
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`h-2 flex-1 rounded-full mx-1 ${
              index <= currentStep ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-1">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default OnboardingProgress;
