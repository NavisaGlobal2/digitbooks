
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
    <div className="space-y-6 w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium mb-2">Connect your bank account</h3>
        <p className="text-sm text-gray-500 mb-4">
          Link your business bank account to automatically import transactions
        </p>
      </div>

      <div className="space-y-3">
        <button 
          className="w-full border border-gray-200 rounded p-3 text-left hover:border-gray-300 transition-colors"
          onClick={onNext}
        >
          <div className="font-medium text-sm">Access Bank</div>
          <div className="text-xs text-gray-500">Connect with Mono</div>
        </button>

        <button 
          className="w-full border border-gray-200 rounded p-3 text-left hover:border-gray-300 transition-colors"
          onClick={onNext}
        >
          <div className="font-medium text-sm">Zenith Bank</div>
          <div className="text-xs text-gray-500">Connect with Mono</div>
        </button>

        <button 
          className="w-full border border-gray-200 rounded p-3 text-left hover:border-gray-300 transition-colors"
          onClick={onNext}
        >
          <div className="font-medium text-sm">GTBank</div>
          <div className="text-xs text-gray-500">Connect with Mono</div>
        </button>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-9 border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={onSkip}
          disabled={isSaving}
        >
          Skip for now
        </Button>
        <Button 
          className="flex-1 bg-black hover:bg-gray-800 text-white h-9"
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
