
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  onClick: () => void;
}

const MobileMenuButton = ({ onClick }: MobileMenuButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
      onClick={onClick}
      aria-label="Open mobile menu"
    >
      <Menu className="h-5 w-5 text-secondary" />
    </Button>
  );
};

export default MobileMenuButton;
