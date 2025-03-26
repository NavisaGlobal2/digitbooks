
import React from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <Button 
      variant="outline" 
      className="w-full h-10 sm:h-12 relative hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
      disabled={isLoading}
      onClick={onClick}
    >
      <img 
        src={icon} 
        alt={altText} 
        className="w-4 sm:w-5 h-4 sm:h-5 absolute left-3 sm:left-4"
      />
      Continue with {provider}
    </Button>
  );
};

export default SocialLoginButton;
