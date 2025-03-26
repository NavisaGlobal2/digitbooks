
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
  
  const handleClick = async () => {
    if (onClick) {
      setIsButtonLoading(true);
      try {
        await onClick();
      } catch (error) {
        console.error(`${provider} authentication error:`, error);
        setIsButtonLoading(false);
      }
    }
  };

  return (
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
  );
};

export default SocialLoginButton;
