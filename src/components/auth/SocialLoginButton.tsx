
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SocialLoginButtonProps {
  icon: string;
  altText: string;
  provider: string;
  isLoading: boolean;
  onClick?: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  icon,
  altText,
  provider,
  isLoading,
  onClick
}) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [buttonError, setButtonError] = useState<string | null>(null);
  
  const handleClick = async () => {
    if (onClick) {
      setButtonError(null);
      setIsButtonLoading(true);
      
      try {
        console.log(`${provider} login button clicked, initiating login flow...`);
        
        // Check if network is available
        if (!navigator.onLine) {
          throw new Error("You appear to be offline. Please check your internet connection.");
        }
        
        await onClick();
        
        // The redirect will happen automatically via Supabase
        // Don't reset button loading state as we're about to navigate away
      } catch (error: any) {
        console.error(`${provider} authentication error:`, error);
        setButtonError(error.message || `Failed to connect to ${provider}`);
        setIsButtonLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
      <Button 
        variant="outline" 
        className="w-full h-10 sm:h-12 relative hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
        disabled={isLoading || isButtonLoading}
        onClick={handleClick}
      >
        {(isLoading || isButtonLoading) ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <img 
            src={icon} 
            alt={altText} 
            className="w-4 sm:w-5 h-4 sm:h-5 absolute left-3 sm:left-4"
          />
        )}
        {isButtonLoading ? "Connecting..." : `Continue with ${provider}`}
      </Button>
      
      {buttonError && (
        <p className="text-xs text-red-500 mt-1 px-1">{buttonError}</p>
      )}
    </div>
  );
};

export default SocialLoginButton;
