
import React from "react";
import { Logo } from "@/components/Logo";

const AuthHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-2 mb-16">
      <Logo className="h-8 w-8" />
      <span className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
        DigitBooks
      </span>
    </div>
  );
};

export default AuthHeader;
