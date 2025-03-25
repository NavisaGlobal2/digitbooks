
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Building, Building2, CircleDollarSign, Wallet, CreditCard, Landmark } from "lucide-react";

interface BankConnectionStepProps {
  onSkip: () => void;
  onNext: () => void;
  onBack?: () => void;
  isSaving?: boolean;
}

const BankConnectionStep: React.FC<BankConnectionStepProps> = ({
  onSkip,
  onNext,
  onBack,
  isSaving = false,
}) => {
  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h3 className="text-2xl font-medium mb-3">Connect your bank account</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Link your business bank account to automatically import transactions and keep your finances up to date
        </p>
      </div>

      <div className="grid gap-6">
        <Button 
          variant="outline" 
          className="h-24 text-left justify-start p-6 group hover:bg-green-50 transition-all duration-300 border-2 hover:border-green-200" 
          onClick={onNext}
        >
          <div className="bg-green-100 p-4 rounded-full mr-6 group-hover:scale-110 transition-transform duration-300">
            <CircleDollarSign className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <div className="font-medium text-lg">Access Bank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-24 text-left justify-start p-6 group hover:bg-blue-50 transition-all duration-300 border-2 hover:border-blue-200" 
          onClick={onNext}
        >
          <div className="bg-blue-100 p-4 rounded-full mr-6 group-hover:scale-110 transition-transform duration-300">
            <Landmark className="h-12 w-12 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-lg">Zenith Bank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-24 text-left justify-start p-6 group hover:bg-orange-50 transition-all duration-300 border-2 hover:border-orange-200" 
          onClick={onNext}
        >
          <div className="bg-orange-100 p-4 rounded-full mr-6 group-hover:scale-110 transition-transform duration-300">
            <Wallet className="h-12 w-12 text-orange-500" />
          </div>
          <div>
            <div className="font-medium text-lg">GTBank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-14 text-lg"
          onClick={onSkip}
          disabled={isSaving}
        >
          Skip for now
        </Button>
        <Button 
          className="flex-1 bg-green-500 hover:bg-green-600 text-white h-14 text-lg"
          onClick={onNext}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Connect Bank"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BankConnectionStep;
