
import React from "react";

interface FormDividerProps {
  text: string;
}

const FormDivider: React.FC<FormDividerProps> = ({ text }) => {
  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t"></div>
      </div>
      <div className="relative flex justify-center text-xs sm:text-sm">
        <span className="bg-gradient-to-b from-white to-gray-50 px-2 text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  );
};

export default FormDivider;
