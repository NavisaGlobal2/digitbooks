
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WelcomeStepProps {
  businessInfo: {
    name: string;
    [key: string]: any;
  };
  setBusinessInfo: (info: any) => void;
  handleNext: () => Promise<boolean>;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ 
  businessInfo, 
  setBusinessInfo, 
  handleNext 
}) => {
  const onNext = async () => {
    if (!businessInfo.name) {
      toast.error("Please enter your business name");
      return;
    }
    await handleNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Hello, I am Digitbooks</h1>
        <p className="text-white/90 mb-6">
          I handle your bookkeeping, track expenses, manage invoices, and generate financial reports—so you can focus on growing your business.
        </p>
        <p className="text-white/90">
          I'd love to get to know your business so I can help you better.
        </p>
      </div>
      
      <div>
        <label htmlFor="business-name" className="block text-white mb-2">
          Business name
        </label>
        <Input
          id="business-name"
          value={businessInfo.name}
          onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
          placeholder="Enter your business name"
          className="bg-white text-black border-transparent focus:ring-0 focus:border-transparent px-4 py-2 h-12 rounded-md"
          autoFocus
        />
      </div>

      <Button 
        className="w-full bg-black hover:bg-black/90 text-white h-12 rounded-md"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
};
