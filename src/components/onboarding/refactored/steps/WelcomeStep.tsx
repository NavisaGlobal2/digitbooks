
import React from "react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to DigiBooks</h1>
      <p className="text-muted-foreground mb-8">
        Let's get your business set up in just a few steps
      </p>
      <Button 
        className="bg-green-500 hover:bg-green-600 text-white"
        onClick={onNext}
      >
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
