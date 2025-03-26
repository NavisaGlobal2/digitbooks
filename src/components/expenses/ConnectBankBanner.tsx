
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ConnectBankBannerProps {
  onConnectBank: () => void;
}

const ConnectBankBanner = ({ onConnectBank }: ConnectBankBannerProps) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-6 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-sm sm:text-base">
          <span className="text-green-500 font-medium cursor-pointer" onClick={onConnectBank}>
            Connect your bank
          </span>{" "}
          to automatically import your expenses from your bank or credit card.
        </span>
      </div>
      <Button variant="ghost" size="sm" className="text-green-500" onClick={onConnectBank}>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ConnectBankBanner;
