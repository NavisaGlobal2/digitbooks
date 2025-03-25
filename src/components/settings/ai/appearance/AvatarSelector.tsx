
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Bot, UserCircle, MessageCircle, User, UserRound } from "lucide-react";

export const avatarOptions = [
  { id: "bot", label: "Robot", icon: <Bot className="h-4 w-4" /> },
  { id: "user", label: "Person", icon: <User className="h-4 w-4" /> },
  { id: "circle", label: "Circle", icon: <UserCircle className="h-4 w-4" /> },
  { id: "round", label: "Round", icon: <UserRound className="h-4 w-4" /> },
  { id: "message", label: "Message", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "custom", label: "Custom", icon: null },
];

export const themeColors = {
  purple: "#9b87f5",
  green: "#05D166",
  blue: "#1EAEDB",
  black: "#222222"
};

export const getAvatarPreview = (avatarType: string, theme: string) => {
  if (avatarType === "custom") {
    return (
      <Avatar className={`h-16 w-16 bg-${theme === "black" ? "gray-800" : themeColors[theme]}`}>
        <AvatarFallback>AI</AvatarFallback>
        <AvatarImage src="/lovable-uploads/a24925e2-43db-4889-a722-45a1c1440051.png" />
      </Avatar>
    );
  }
  
  const avatarOption = avatarOptions.find(option => option.id === avatarType);
  
  return (
    <Avatar className={`h-16 w-16 bg-${theme === "black" ? "gray-800" : themeColors[theme]}`}>
      <AvatarFallback className="flex items-center justify-center text-white">
        {avatarOption?.icon || "AI"}
      </AvatarFallback>
    </Avatar>
  );
};

type AvatarSelectorProps = {
  avatarType: string;
  setAvatarType: (value: string) => void;
  theme: string;
};

const AvatarSelector = ({ 
  avatarType, 
  setAvatarType, 
  theme 
}: AvatarSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Avatar</Label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center justify-center">
          {getAvatarPreview(avatarType, theme)}
        </div>
        <div className="flex-1 space-y-2">
          <RadioGroup 
            value={avatarType}
            onValueChange={setAvatarType}
            className="grid grid-cols-2 gap-2"
          >
            {avatarOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`avatar-${option.id}`} />
                <Label htmlFor={`avatar-${option.id}`} className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {avatarType === "custom" && (
            <div className="mt-2">
              <Label htmlFor="custom-avatar">Image URL</Label>
              <Input
                id="custom-avatar"
                placeholder="https://example.com/image.png"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For a custom avatar, an image URL is required
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
