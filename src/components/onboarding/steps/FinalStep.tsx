
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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
  const getIndustryLabel = (value: string) => {
    const industry = industries.find(ind => ind.value === value);
    return industry ? industry.label : value;
  };

  const onNext = async () => {
    await handleNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">All set! Let's begin</h2>
        <p className="text-white/80">
          Here's a summary of your business information
        </p>
      </div>
      
      <div className="space-y-4 bg-white/10 p-4 rounded-lg">
        <div className="flex justify-between">
          <span className="text-white/70">Business name</span>
          <span className="text-white font-medium">{businessInfo.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Industry</span>
          <span className="text-white font-medium">{getIndustryLabel(businessInfo.industry)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Registration number</span>
          <span className="text-white font-medium">{legalInfo.rcNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Business size</span>
          <span className="text-white font-medium">{businessInfo.size} employees</span>
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <Button 
          className="w-1/3 border border-white/20 bg-transparent hover:bg-white/10 text-white h-12 rounded-md"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button 
          className="w-2/3 bg-black hover:bg-black/90 text-white h-12 rounded-md"
          onClick={onNext}
        >
          Let's begin
        </Button>
      </div>
    </div>
  );
};
