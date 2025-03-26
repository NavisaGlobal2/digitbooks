
import React from "react";
import { Input } from "@/components/ui/input";

interface NameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const NameField: React.FC<NameFieldProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Enter your full name"
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="h-10 sm:h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20 text-sm sm:text-base"
      />
    </div>
  );
};

export default NameField;
