
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ExpenseCategory } from "@/types/expense";

interface CategorySelectProps {
  id: string;
  value?: ExpenseCategory;
  onChange: (category: ExpenseCategory) => void;
}

export const CategorySelect = ({ id, value, onChange }: CategorySelectProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | undefined>(value);
  
  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== selectedCategory) {
      setSelectedCategory(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue: string) => {
    const category = newValue as ExpenseCategory;
    setSelectedCategory(category);
    onChange(category);
    console.log(`Category for transaction ${id} changed to: ${category}`);
  };

  return (
    <Select 
      value={selectedCategory} 
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="office">Office</SelectItem>
          <SelectItem value="travel">Travel</SelectItem>
          <SelectItem value="meals">Meals</SelectItem>
          <SelectItem value="utilities">Utilities</SelectItem>
          <SelectItem value="rent">Rent</SelectItem>
          <SelectItem value="software">Software</SelectItem>
          <SelectItem value="hardware">Hardware</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="salaries">Salaries</SelectItem>
          <SelectItem value="taxes">Taxes</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
