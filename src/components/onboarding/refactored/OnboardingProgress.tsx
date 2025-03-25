
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
    <div className="mb-6 md:mb-8 w-full">
      <div className="flex justify-between mb-4 md:mb-6 relative px-2 md:px-4 mx-auto">
        {/* Progress bar background */}
        <div className="absolute h-1.5 bg-border w-full top-1/2 transform -translate-y-1/2 rounded-full"></div>
        
        {/* Active progress bar */}
        <div 
          className="absolute h-1.5 bg-primary transition-all duration-700 ease-in-out top-1/2 transform -translate-y-1/2 rounded-full"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Step indicators */}
        {steps.map((step, index) => (
          <div 
            key={index}
            className="relative z-10 flex flex-col items-center"
          >
            <div 
              className={`h-4 w-4 sm:h-5 sm:h-5 md:h-6 md:w-6 rounded-full transition-all duration-500 ease-in-out ${
                index < currentStep 
                  ? 'bg-primary scale-110' 
                  : index === currentStep 
                    ? 'bg-primary ring-4 ring-primary/20 scale-125 animate-pulse' 
                    : 'bg-border'
              }`}
            ></div>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-6 md:mb-10 animate-fade-in transition-all duration-500 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {steps[currentStep].title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  );
};

export default OnboardingProgress;
