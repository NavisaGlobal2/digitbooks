
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-6 rounded-full">
          <Rocket className="h-16 w-16 text-green-500 animate-pulse" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Welcome to DigiBooks</h1>
      <p className="text-muted-foreground mb-8">
        Let's get your business set up in just a few steps
      </p>
      <Button 
        className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white group transition-all duration-300"
        onClick={onNext}
      >
        Get Started
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
      </Button>
    </div>
  );
};

export default WelcomeStep;
