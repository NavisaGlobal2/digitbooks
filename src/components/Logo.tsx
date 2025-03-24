
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img
      src="/lovable-uploads/164ead0a-df60-46aa-bfad-9e3dd948bc33.png"
      alt="DigiBooks Logo"
      className={className}
    />
  );
};
