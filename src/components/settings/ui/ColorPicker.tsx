
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState(color);
  
  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };
  
  const handleAccept = () => {
    onChange(selectedColor);
  };

  const presetColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#10b981", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#d946ef", // purple
    "#ec4899"  // pink
  ];

  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[80px] h-[36px] border-2" 
            style={{ backgroundColor: color }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px]">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="color-input">Select Color</Label>
              <div className="flex gap-2">
                <input
                  id="color-input"
                  type="color"
                  value={selectedColor}
                  onChange={handleColorChange}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Preset Colors</Label>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className="w-8 h-8 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05D166]"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setSelectedColor(presetColor)}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleAccept}
                className="bg-[#05D166] hover:bg-[#05D166]/80 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1">
        <input 
          type="text" 
          value={color}
          readOnly
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>
    </div>
  );
};
