
import React from "react";

interface OnboardingStepsProps {
  children: React.ReactNode;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ children }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-border/30 transition-all duration-500 max-w-3xl w-full mx-auto">
      {children}
    </div>
  );
};

export default OnboardingSteps;
