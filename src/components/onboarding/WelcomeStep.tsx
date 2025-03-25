
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="bg-gray-100 p-6 rounded-lg">
            <Rocket className="h-16 w-16 text-gray-700" />
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Welcome to DigiBooks</h1>
      
      <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
        Let's get your business set up in just a few steps and unlock the full potential of your financial management
      </p>
      
      <Button 
        className="px-8 py-5 bg-black hover:bg-gray-800 text-white text-lg rounded-md"
        onClick={onNext}
      >
        Get Started
        <ArrowRight className="ml-3 h-5 w-5" />
      </Button>
    </div>
  );
};

export default WelcomeStep;
