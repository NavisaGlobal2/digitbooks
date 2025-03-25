
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface BusinessInfoStepProps {
  businessInfo: {
    industry: string;
    state: string;
    [key: string]: any;
  };
  setBusinessInfo: (info: any) => void;
  handleNext: () => Promise<boolean>;
  handleBack: () => void;
  industries: { value: string; label: string; }[];
}

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ 
  businessInfo, 
  setBusinessInfo, 
  handleNext, 
  handleBack,
  industries 
}) => {
  const onNext = async () => {
    if (!businessInfo.industry) {
      toast.error("Please select your industry");
      return;
    }
    await handleNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Great! I need more information about your business</h2>
      </div>
      
      <div className="transition-all duration-200">
        <label htmlFor="industry" className="block text-white mb-2">
          Business industry
        </label>
        <Select 
          value={businessInfo.industry}
          onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}
        >
          <SelectTrigger className="bg-white text-black focus:ring-2 focus:ring-white">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="transition-all duration-200">
        <label htmlFor="location" className="block text-white mb-2">
          Business location
        </label>
        <Select 
          value={businessInfo.state}
          onValueChange={(value) => setBusinessInfo({ ...businessInfo, state: value })}
        >
          <SelectTrigger className="bg-white text-black focus:ring-2 focus:ring-white">
            <SelectValue placeholder="Ikorodu Lagos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lagos">Lagos</SelectItem>
            <SelectItem value="abuja">Abuja</SelectItem>
            <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
            <SelectItem value="kano">Kano</SelectItem>
          </SelectContent>
        </Select>
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
          Continue
        </Button>
      </div>
    </div>
  );
};
