
import React from "react";

interface OnboardingStepsProps {
  children: React.ReactNode;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {children}
    </div>
  );
};

export default OnboardingSteps;
