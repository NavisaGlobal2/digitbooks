
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Stars, Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="absolute -top-12 -left-12 opacity-60">
            <Stars className="h-10 w-10 text-blue-300 animate-pulse" />
          </div>
          <div className="absolute -top-6 -right-10 opacity-70">
            <Sparkles className="h-8 w-8 text-orange-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105">
            <Rocket className="h-20 w-20 text-green-500 animate-float" />
          </div>
          <div className="absolute -bottom-6 -right-8 opacity-60">
            <Stars className="h-8 w-8 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute -bottom-10 -left-10 opacity-70">
            <Sparkles className="h-10 w-10 text-yellow-300 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Welcome to DigiBooks</h1>
      
      <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
        Let's get your business set up in just a few steps and unlock the full potential of your financial management
      </p>
      
      <Button 
        className="px-10 py-6 bg-green-500 hover:bg-green-600 text-white text-lg group transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
        onClick={onNext}
      >
        Get Started
        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
      </Button>
    </div>
  );
};

export default WelcomeStep;
