
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8 py-6">      
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Welcome to DigiBooks</h1>
      
      <p className="text-gray-500 mb-8 text-sm max-w-md mx-auto">
        Let's get your business set up in just a few steps and unlock the full potential of your financial management
      </p>
      
      <Button 
        className="px-8 py-2.5 bg-[#05D166] hover:bg-[#05D166]/90 text-white rounded-md transition-all duration-300"
        onClick={onNext}
      >
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WelcomeStep;
