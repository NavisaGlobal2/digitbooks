
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/types/onboarding";
import { CheckCircle2 } from "lucide-react";

interface FeaturesStepProps {
  features: FeatureState;
  onFeaturesChange: (features: FeatureState) => void;
  onNext: () => void;
  onBack?: () => void;
}

const FeaturesStep: React.FC<FeaturesStepProps> = ({
  features,
  onFeaturesChange,
  onNext,
  onBack,
}) => {
  const getFeatureDescription = (feature: string): string => {
    const descriptions: Record<string, string> = {
      invoicing: "Create and manage professional invoices",
      expenses: "Track and categorize business expenses",
      banking: "Connect and sync bank transactions",
      reports: "Generate detailed financial reports",
      budgeting: "Create and manage business budgets",
      inventory: "Track inventory and stock levels"
    };
    return descriptions[feature] || "";
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(features).map(([feature, enabled]) => (
          <Card 
            key={feature}
            className={`p-3 cursor-pointer transition-colors ${
              enabled 
                ? 'border-[#05D166]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onFeaturesChange({
              ...features, 
              [feature]: !enabled
            })}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium capitalize">{feature}</h3>
                {enabled && <CheckCircle2 className="h-4 w-4 text-[#05D166]" />}
              </div>
              <p className="text-xs text-gray-500 flex-grow">
                {getFeatureDescription(feature)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Button 
        className="w-full bg-[#05D166] hover:bg-[#05D166]/90 text-white h-10 mt-6 rounded-md transition-all duration-300"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default FeaturesStep;
