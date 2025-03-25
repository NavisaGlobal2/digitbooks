
import { useState } from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValue: string;
  onFilterChange: (value: string) => void;
  label?: string;
  variant?: "default" | "outline"; 
  className?: string;
}

const FilterDropdown = ({
  options,
  selectedValue,
  onFilterChange,
  label = "Filters",
  variant = "outline",
  className = "",
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (value: string) => {
    onFilterChange(value);
    setOpen(false);
  };
  
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : label;
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={`flex items-center gap-2 ${className}`}>
          <Filter className="h-4 w-4" />
          <span>{displayLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              {option.label}
              {selectedValue === option.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
