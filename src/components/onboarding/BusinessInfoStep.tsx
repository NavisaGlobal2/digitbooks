
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateBusinessInfo } from "@/utils/validationUtils";
import { toast } from "sonner";
import { BusinessInfo, BusinessType, Industry } from "@/types/onboarding";

interface BusinessInfoStepProps {
  businessInfo: BusinessInfo;
  onBusinessInfoChange: (info: BusinessInfo) => void;
  onNext: () => void;
  onBack?: () => void;
  businessTypes: BusinessType[];
  industries: Industry[];
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  businessInfo,
  onBusinessInfoChange,
  onNext,
  onBack,
  businessTypes,
  industries,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleNext = () => {
    const validation = validateBusinessInfo(businessInfo);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fill in all required fields");
      return;
    }
    
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="business-name" className={errors.name ? "text-red-500" : "text-gray-700"}>
          Business name *
        </Label>
        <Input
          id="business-name"
          value={businessInfo.name}
          onChange={(e) => {
            onBusinessInfoChange({ ...businessInfo, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          placeholder="Enter your business name"
          className={`${errors.name ? "border-red-500" : "border-gray-200"} h-9`}
          required
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type" className={errors.type ? "text-red-500" : "text-gray-700"}>
          Business type *
        </Label>
        <Select 
          value={businessInfo.type}
          onValueChange={(value) => {
            onBusinessInfoChange({ ...businessInfo, type: value });
            if (errors.type) setErrors({ ...errors, type: "" });
          }}
        >
          <SelectTrigger className={`${errors.type ? "border-red-500" : "border-gray-200"} h-9`}>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-xs text-red-500">{errors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className={errors.industry ? "text-red-500" : "text-gray-700"}>
          Industry *
        </Label>
        <Select 
          value={businessInfo.industry}
          onValueChange={(value) => {
            onBusinessInfoChange({ ...businessInfo, industry: value });
            if (errors.industry) setErrors({ ...errors, industry: "" });
          }}
        >
          <SelectTrigger className={`${errors.industry ? "border-red-500" : "border-gray-200"} h-9`}>
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
        {errors.industry && (
          <p className="text-xs text-red-500">{errors.industry}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Business phone</Label>
          <Input
            id="phone"
            type="tel"
            value={businessInfo.phone}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, phone: e.target.value })}
            placeholder="Enter phone"
            className="border-gray-200 h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-700">Business website</Label>
          <Input
            id="website"
            type="url"
            value={businessInfo.website}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, website: e.target.value })}
            placeholder="Enter website"
            className="border-gray-200 h-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-700">Business address</Label>
        <Input
          id="address"
          value={businessInfo.address}
          onChange={(e) => onBusinessInfoChange({ ...businessInfo, address: e.target.value })}
          placeholder="Enter business address"
          className="border-gray-200 h-9"
        />
      </div>

      <Button 
        className="w-full bg-[#05D166] hover:bg-[#05D166]/90 text-white h-9 mt-4"
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default BusinessInfoStep;
