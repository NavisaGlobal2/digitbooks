
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Connect your bank account</h3>
        <p className="text-muted-foreground mb-6">
          Link your business bank account to automatically import transactions
        </p>
      </div>

      <div className="grid gap-4">
        <Button variant="outline" className="h-20 text-left justify-start">
          <div>
            <div className="font-medium">Access Bank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>

        <Button variant="outline" className="h-20 text-left justify-start">
          <div>
            <div className="font-medium">Zenith Bank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>

        <Button variant="outline" className="h-20 text-left justify-start">
          <div>
            <div className="font-medium">GTBank</div>
            <div className="text-sm text-muted-foreground">Connect with Mono</div>
          </div>
        </Button>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onSkip}
          disabled={isSaving}
        >
          Skip for now
        </Button>
        <Button 
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={onNext}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
