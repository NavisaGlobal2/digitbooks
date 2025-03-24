
import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img
      src="/lovable-uploads/149e5423-3356-4c4d-9769-ce16d23c9792.png"
      alt="DigiBooks Logo"
      className={className}
    />
  );
};
