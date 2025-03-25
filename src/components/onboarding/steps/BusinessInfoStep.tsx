
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
      
      <div className="transition-all">
        <label htmlFor="industry" className="block text-white mb-2">
          Business industry
        </label>
        <Select 
          value={businessInfo.industry}
          onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}
        >
          <SelectTrigger className="bg-white text-black border-transparent focus:ring-0 focus:border-transparent h-12 rounded-md">
            <SelectValue placeholder="Information technology services" />
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

      <div className="transition-all">
        <label htmlFor="location" className="block text-white mb-2">
          Business location
        </label>
        <Select 
          value={businessInfo.state}
          onValueChange={(value) => setBusinessInfo({ ...businessInfo, state: value })}
        >
          <SelectTrigger className="bg-white text-black border-transparent focus:ring-0 focus:border-transparent h-12 rounded-md">
            <div className="flex items-center">
              {businessInfo.state === "lagos" && (
                <div className="w-6 h-6 bg-green-100 rounded-full mr-2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              )}
              <SelectValue placeholder="Ikorodu Lagos" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lagos">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full mr-2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <span>Ikorodu Lagos</span>
              </div>
            </SelectItem>
            <SelectItem value="abuja">Abuja</SelectItem>
            <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
            <SelectItem value="kano">Kano</SelectItem>
          </SelectContent>
        </Select>
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
          Continue
        </Button>
      </div>
    </div>
  );
};
