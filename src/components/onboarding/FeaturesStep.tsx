
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/types/onboarding";

interface FeaturesStepProps {
  features: FeatureState;
  onFeaturesChange: (features: FeatureState) => void;
  onNext: () => void;
}

const FeaturesStep: React.FC<FeaturesStepProps> = ({
  features,
  onFeaturesChange,
  onNext,
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(features).map(([feature, enabled]) => (
          <Card 
            key={feature}
            className={`p-4 cursor-pointer transition-colors ${
              enabled ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onFeaturesChange({
              ...features, 
              [feature]: !enabled
            })}
          >
            <h3 className="font-medium capitalize">{feature}</h3>
            <p className="text-sm text-muted-foreground">
              {getFeatureDescription(feature)}
            </p>
          </Card>
        ))}
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

export default FeaturesStep;
