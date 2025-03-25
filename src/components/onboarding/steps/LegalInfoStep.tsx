
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LegalInfoStepProps {
  legalInfo: {
    rcNumber: string;
    [key: string]: any;
  };
  setLegalInfo: (info: any) => void;
  businessInfo: {
    size: string;
    [key: string]: any;
  };
  setBusinessInfo: (info: any) => void;
  handleNext: () => Promise<boolean>;
  handleBack: () => void;
}

export const LegalInfoStep: React.FC<LegalInfoStepProps> = ({ 
  legalInfo, 
  setLegalInfo, 
  businessInfo,
  setBusinessInfo,
  handleNext, 
  handleBack 
}) => {
  const onNext = async () => {
    if (!legalInfo.rcNumber) {
      toast.error("Please provide your RC Number");
      return;
    }
    await handleNext();
  };

  return (
    <div className="space-y-6">
      <div className="transition-all">
        <label htmlFor="rc-number" className="block text-white mb-2">
          Business registration number
        </label>
        <Input
          id="rc-number"
          value={legalInfo.rcNumber}
          onChange={(e) => setLegalInfo({ ...legalInfo, rcNumber: e.target.value })}
          placeholder="RC123456"
          className="bg-white text-black border-transparent focus:ring-0 focus:border-transparent px-4 py-2 h-12 rounded-md"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-white mb-2">
          Business size
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className={`flex items-center justify-center space-x-2 rounded-md px-4 py-2 cursor-pointer transition-all h-12 ${businessInfo.size === "1-5" ? "bg-black text-white" : "bg-white text-black"}`}>
            <input
              type="radio"
              checked={businessInfo.size === "1-5"}
              onChange={() => setBusinessInfo({ ...businessInfo, size: "1-5" })}
              className="hidden"
            />
            <div className="flex items-center space-x-2">
              {businessInfo.size === "1-5" && (
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {businessInfo.size !== "1-5" && (
                <div className="w-4 h-4 rounded-full border-2 border-black"></div>
              )}
              <span>1-5 staffs</span>
            </div>
          </label>
          
          <label className={`flex items-center justify-center space-x-2 rounded-md px-4 py-2 cursor-pointer transition-all h-12 ${businessInfo.size === "6-20" ? "bg-black text-white" : "bg-white text-black"}`}>
            <input
              type="radio"
              checked={businessInfo.size === "6-20"}
              onChange={() => setBusinessInfo({ ...businessInfo, size: "6-20" })}
              className="hidden"
            />
            <div className="flex items-center space-x-2">
              {businessInfo.size === "6-20" && (
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {businessInfo.size !== "6-20" && (
                <div className="w-4 h-4 rounded-full border-2 border-black"></div>
              )}
              <span>6-20 staffs</span>
            </div>
          </label>
          
          <label className={`flex items-center justify-center space-x-2 rounded-md px-4 py-2 cursor-pointer transition-all h-12 ${businessInfo.size === "20+" ? "bg-black text-white" : "bg-white text-black"}`}>
            <input
              type="radio"
              checked={businessInfo.size === "20+"}
              onChange={() => setBusinessInfo({ ...businessInfo, size: "20+" })}
              className="hidden"
            />
            <div className="flex items-center space-x-2">
              {businessInfo.size === "20+" && (
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {businessInfo.size !== "20+" && (
                <div className="w-4 h-4 rounded-full border-2 border-black"></div>
              )}
              <span>20+ staffs</span>
            </div>
          </label>
        </div>
      </div>

      <div className="transition-all">
        <label htmlFor="currency" className="block text-white mb-2">
          Preferred currency
        </label>
        <Select 
          value="NGN"
          onValueChange={() => {}}
        >
          <SelectTrigger className="bg-white text-black border-transparent focus:ring-0 focus:border-transparent h-12 rounded-md">
            <SelectValue placeholder="Naira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NGN">Naira</SelectItem>
            <SelectItem value="USD">US Dollar</SelectItem>
            <SelectItem value="EUR">Euro</SelectItem>
            <SelectItem value="GBP">British Pound</SelectItem>
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
