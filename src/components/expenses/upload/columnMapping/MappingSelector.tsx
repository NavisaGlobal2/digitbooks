
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MappingSelectorProps {
  label: string;
  headers: string[];
  selectedIndex: number;
  onChange: (value: number) => void;
  required?: boolean;
}

const MappingSelector = ({ 
  label, 
  headers, 
  selectedIndex, 
  onChange,
  required = false
}: MappingSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        value={selectedIndex.toString()} 
        onValueChange={(value) => onChange(parseInt(value, 10))}
      >
        <SelectTrigger className={selectedIndex === -1 && required ? "border-red-300" : ""}>
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-1">Not mapped</SelectItem>
          {headers.map((header, index) => (
            <SelectItem key={index} value={index.toString()}>
              {header} (column {index + 1})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MappingSelector;
