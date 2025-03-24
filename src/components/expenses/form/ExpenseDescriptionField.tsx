
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ExpenseDescriptionFieldProps {
  description: string;
  setDescription: (value: string) => void;
}

const ExpenseDescriptionField = ({ 
  description, 
  setDescription 
}: ExpenseDescriptionFieldProps) => {
  return (
    <div>
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the expense"
      />
    </div>
  );
};

export default ExpenseDescriptionField;
