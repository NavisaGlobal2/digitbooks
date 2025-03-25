
import { useState } from "react";
import { Bot, Save, RefreshCw } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppearanceSettings from "./ai/AppearanceSettings";
import BehaviorSettings from "./ai/BehaviorSettings";
import InstructionsSettings from "./ai/InstructionsSettings";

export const AISettings = () => {
  const [botName, setBotName] = useState("DigiBooks AI");
  const [botPrompt, setBotPrompt] = useState("You are a helpful finance assistant. Help users with their accounting and financial questions.");
  const [autoOpen, setAutoOpen] = useState(false);
  const [theme, setTheme] = useState("purple");
  const [messageStyle, setMessageStyle] = useState("bubble");
  const [autoRespond, setAutoRespond] = useState(false);
  const [model, setModel] = useState("standard");
  const [avatarType, setAvatarType] = useState("bot");
  
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

      <AppearanceSettings 
        botName={botName}
        setBotName={setBotName}
        theme={theme}
        setTheme={setTheme}
        messageStyle={messageStyle}
        setMessageStyle={setMessageStyle}
        avatarType={avatarType}
        setAvatarType={setAvatarType}
      />

      <BehaviorSettings
        autoOpen={autoOpen}
        setAutoOpen={setAutoOpen}
        autoRespond={autoRespond}
        setAutoRespond={setAutoRespond}
        model={model}
        setModel={setModel}
      />

      <InstructionsSettings
        botPrompt={botPrompt}
        setBotPrompt={setBotPrompt}
      />

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
