
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FinalStepProps {
  businessInfo: {
    name: string;
    industry: string;
    [key: string]: any;
  };
  legalInfo: {
    rcNumber: string;
    [key: string]: any;
  };
  handleNext: () => Promise<boolean>;
  handleBack: () => void;
  industries: { value: string; label: string; }[];
}

export const FinalStep: React.FC<FinalStepProps> = ({ 
  businessInfo, 
  legalInfo, 
  handleNext, 
  handleBack,
  industries 
}) => {
  const onNext = async () => {
    const succeeded = await handleNext();
    if (succeeded) {
      toast.success("Setup completed! Welcome to DigiBooks");
    } else {
      toast.error("Failed to save business profile");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Ready to start your financial journey!</h2>
      <p className="text-white/80 mb-8">
        Your business profile has been set up. Now let's start managing your finances more efficiently.
      </p>
      
      <div className="space-y-4">
        <div className="bg-white/20 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-1">Business Name</h3>
          <p className="text-white/90">{businessInfo.name || "Not provided"}</p>
        </div>
        
        <div className="bg-white/20 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-1">Industry</h3>
          <p className="text-white/90">{businessInfo.industry ? industries.find(i => i.value === businessInfo.industry)?.label : "Not selected"}</p>
        </div>
        
        <div className="bg-white/20 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-1">RC Number</h3>
          <p className="text-white/90">{legalInfo.rcNumber || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex space-x-4 pt-4">
        <Button 
          className="w-1/3 border border-white/20 bg-[#05D166]/20 hover:bg-[#05D166]/30 text-white"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button 
          className="w-2/3 bg-black hover:bg-black/90 text-white"
          onClick={onNext}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
