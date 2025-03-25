
import { useState } from "react";
import { Bot, UserCircle, MessageCircle, User, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AppearanceSettingsProps = {
  botName: string;
  setBotName: (name: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  messageStyle: string;
  setMessageStyle: (style: string) => void;
  avatarType: string;
  setAvatarType: (type: string) => void;
};

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

const AppearanceSettings = ({
  botName,
  setBotName,
  theme,
  setTheme,
  messageStyle,
  setMessageStyle,
  avatarType,
  setAvatarType
}: AppearanceSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the AI assistant looks in your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bot-name">Assistant Name</Label>
            <Input
              id="bot-name"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="DigiBooks AI"
            />
          </div>
          
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
        </div>

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

        <div className="space-y-2">
          <Label>Message Style</Label>
          <RadioGroup 
            value={messageStyle}
            onValueChange={setMessageStyle}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bubble" id="bubble" />
              <Label htmlFor="bubble">Bubble</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flat" id="flat" />
              <Label htmlFor="flat">Flat</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal">Minimal</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
