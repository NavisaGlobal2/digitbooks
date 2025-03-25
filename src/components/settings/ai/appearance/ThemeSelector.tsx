
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { themeColors } from "./AvatarSelector";

type ThemeSelectorProps = {
  theme: string;
  setTheme: (value: string) => void;
};

const ThemeSelector = ({ theme, setTheme }: ThemeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Theme Color</Label>
      <ToggleGroup 
        type="single" 
        value={theme}
        onValueChange={(value) => value && setTheme(value)}
        className="justify-start"
      >
        <ToggleGroupItem value="purple" className="bg-[#9b87f5] h-8 w-8 rounded-full p-0 border-2 data-[state=on]:border-black" />
        <ToggleGroupItem value="green" className="bg-[#05D166] h-8 w-8 rounded-full p-0 border-2 data-[state=on]:border-black" />
        <ToggleGroupItem value="blue" className="bg-[#1EAEDB] h-8 w-8 rounded-full p-0 border-2 data-[state=on]:border-black" />
        <ToggleGroupItem value="black" className="bg-[#222222] h-8 w-8 rounded-full p-0 border-2 data-[state=on]:border-white" />
      </ToggleGroup>
    </div>
  );
};

export default ThemeSelector;
