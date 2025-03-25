
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/types/onboarding";
import { 
  FileText, 
  CreditCard, 
  BarChart2, 
  BriefcaseBusiness, 
  PiggyBank, 
  Package,
  CheckCircle2 
} from "lucide-react";

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

  const getFeatureIcon = (feature: string) => {
    switch(feature) {
      case 'invoicing':
        return <FileText className="h-10 w-10 mb-3 text-green-500" />;
      case 'expenses':
        return <CreditCard className="h-10 w-10 mb-3 text-orange-500" />;
      case 'banking':
        return <BriefcaseBusiness className="h-10 w-10 mb-3 text-blue-500" />;
      case 'reports':
        return <BarChart2 className="h-10 w-10 mb-3 text-purple-500" />;
      case 'budgeting':
        return <PiggyBank className="h-10 w-10 mb-3 text-pink-500" />;
      case 'inventory':
        return <Package className="h-10 w-10 mb-3 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 py-4 w-full">
      <div className="grid grid-cols-2 gap-5">
        {Object.entries(features).map(([feature, enabled]) => (
          <Card 
            key={feature}
            className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-md ${
              enabled 
                ? 'border-primary bg-primary/5 shadow-md transform scale-[1.02]' 
                : 'hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onFeaturesChange({
              ...features, 
              [feature]: !enabled
            })}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`relative rounded-full p-3 ${enabled ? 'bg-primary/10' : 'bg-gray-100'}`}>
                {getFeatureIcon(feature)}
                {enabled && (
                  <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <h3 className="font-medium capitalize text-lg mt-2">{feature}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {getFeatureDescription(feature)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Button 
        className="w-full bg-green-500 hover:bg-green-600 text-white h-14 text-lg mt-6"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default FeaturesStep;
