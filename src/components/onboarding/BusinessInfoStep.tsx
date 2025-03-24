
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessInfo {
  name: string;
  type: string;
  industry: string;
  size: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  website: string;
}

interface BusinessInfoStepProps {
  businessInfo: BusinessInfo;
  onBusinessInfoChange: (info: BusinessInfo) => void;
  onNext: () => void;
  businessTypes: { value: string; label: string }[];
  industries: { value: string; label: string }[];
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  businessInfo,
  onBusinessInfoChange,
  onNext,
  businessTypes,
  industries,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="business-name">Business name *</Label>
        <Input
          id="business-name"
          value={businessInfo.name}
          onChange={(e) => onBusinessInfoChange({ ...businessInfo, name: e.target.value })}
          placeholder="Enter your business name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type">Business type *</Label>
        <Select 
          value={businessInfo.type}
          onValueChange={(value) => onBusinessInfoChange({ ...businessInfo, type: value })}
        >
          <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select 
          value={businessInfo.industry}
          onValueChange={(value) => onBusinessInfoChange({ ...businessInfo, industry: value })}
        >
          <SelectTrigger>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Business phone</Label>
          <Input
            id="phone"
            type="tel"
            value={businessInfo.phone}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, phone: e.target.value })}
            placeholder="Enter business phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Business website</Label>
          <Input
            id="website"
            type="url"
            value={businessInfo.website}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, website: e.target.value })}
            placeholder="Enter website URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business address</Label>
        <Input
          id="address"
          value={businessInfo.address}
          onChange={(e) => onBusinessInfoChange({ ...businessInfo, address: e.target.value })}
          placeholder="Enter business address"
        />
      </div>

      <Button 
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default BusinessInfoStep;
