
import { useState } from "react";
import { Bot, Save, RefreshCw, UserCircle, MessageCircle, User, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AISettings = () => {
  const [botName, setBotName] = useState("DigiBooks AI");
  const [botPrompt, setBotPrompt] = useState("You are a helpful finance assistant. Help users with their accounting and financial questions.");
  const [autoOpen, setAutoOpen] = useState(false);
  const [theme, setTheme] = useState("purple");
  const [messageStyle, setMessageStyle] = useState("bubble");
  const [autoRespond, setAutoRespond] = useState(false);
  const [model, setModel] = useState("standard");
  const [avatarType, setAvatarType] = useState("bot");
  
  const avatarOptions = [
    { id: "bot", label: "Robot", icon: <Bot className="h-4 w-4" /> },
    { id: "user", label: "Person", icon: <User className="h-4 w-4" /> },
    { id: "circle", label: "Circle", icon: <UserCircle className="h-4 w-4" /> },
    { id: "round", label: "Round", icon: <UserRound className="h-4 w-4" /> },
    { id: "message", label: "Message", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "custom", label: "Custom", icon: null },
  ];

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to a database or local storage
    toast.success("AI settings saved successfully");
  };

  const handleResetDefaults = () => {
    setBotName("DigiBooks AI");
    setBotPrompt("You are a helpful finance assistant. Help users with their accounting and financial questions.");
    setAutoOpen(false);
    setTheme("purple");
    setMessageStyle("bubble");
    setAutoRespond(false);
    setModel("standard");
    setAvatarType("bot");
    toast.info("AI settings reset to defaults");
  };

  const getAvatarPreview = () => {
    const themeColors = {
      purple: "#9b87f5",
      green: "#05D166",
      blue: "#1EAEDB",
      black: "#222222"
    };
    
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">AI Assistant Settings</h3>
          <p className="text-sm text-muted-foreground">
            Customize how the DigiBooks AI assistant works for you
          </p>
        </div>
        <Bot className="h-8 w-8 text-[#9b87f5]" />
      </div>

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
                {getAvatarPreview()}
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

      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
          <CardDescription>
            Configure how the AI assistant behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-open">Auto-open on dashboard</Label>
              <p className="text-sm text-muted-foreground">
                Open AI assistant automatically when you visit the dashboard
              </p>
            </div>
            <Switch
              id="auto-open"
              checked={autoOpen}
              onCheckedChange={setAutoOpen}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-respond">Proactive insights</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to proactively suggest insights based on your data
              </p>
            </div>
            <Switch
              id="auto-respond"
              checked={autoRespond}
              onCheckedChange={setAutoRespond}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Default)</SelectItem>
                <SelectItem value="advanced">Advanced (More capabilities)</SelectItem>
                <SelectItem value="finance">Finance Specialized</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Advanced models may use more resources but provide more detailed responses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Instructions</CardTitle>
          <CardDescription>
            Customize the base instructions for the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={botPrompt}
            onChange={(e) => setBotPrompt(e.target.value)}
            placeholder="Enter custom instructions for the AI assistant..."
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground mt-2">
            These instructions help guide the AI in how it should respond to your queries
          </p>
        </CardContent>
      </Card>

      <CardFooter className="flex justify-between px-0">
        <Button variant="outline" onClick={handleResetDefaults} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2 bg-[#9b87f5] hover:bg-[#7E69AB]">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </div>
  );
};

export default AISettings;
