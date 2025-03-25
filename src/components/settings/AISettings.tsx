
import { useState, useEffect } from "react";
import { Bot, Save, RefreshCw } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppearanceSettings from "./ai/AppearanceSettings";
import BehaviorSettings from "./ai/BehaviorSettings";
import InstructionsSettings from "./ai/InstructionsSettings";
import { supabase } from "@/integrations/supabase/client";

export const AISettings = () => {
  const [botName, setBotName] = useState("DigiBooks AI");
  const [botPrompt, setBotPrompt] = useState("You are a helpful finance assistant. Help users with their accounting and financial questions.");
  const [autoOpen, setAutoOpen] = useState(false);
  const [theme, setTheme] = useState("purple");
  const [messageStyle, setMessageStyle] = useState("bubble");
  const [autoRespond, setAutoRespond] = useState(false);
  const [model, setModel] = useState("standard");
  const [avatarType, setAvatarType] = useState("bot");
  const [customUrl, setCustomUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_settings')
          .select('*')
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error fetching AI settings:', error);
            toast.error('Failed to load AI settings');
          }
          return;
        }
        
        if (data) {
          setBotName(data.bot_name || "DigiBooks AI");
          setBotPrompt(data.bot_prompt || "You are a helpful finance assistant. Help users with their accounting and financial questions.");
          setAutoOpen(data.auto_open || false);
          setTheme(data.theme || "purple");
          setMessageStyle(data.message_style || "bubble");
          setAutoRespond(data.auto_respond || false);
          setModel(data.model || "standard");
          setAvatarType(data.avatar_type || "bot");
          setCustomUrl(data.custom_url || "");
          setUploadedUrl(data.uploaded_url || "");
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
        toast.error('Failed to load AI settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settings = {
        bot_name: botName,
        bot_prompt: botPrompt,
        auto_open: autoOpen,
        theme,
        message_style: messageStyle,
        auto_respond: autoRespond,
        model,
        avatar_type: avatarType,
        custom_url: customUrl,
        uploaded_url: uploadedUrl,
      };

      const { data, error } = await supabase
        .from('ai_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) {
        console.error('Error saving AI settings:', error);
        throw error;
      }

      toast.success("AI settings saved successfully");
    } catch (error) {
      console.error('Error in handleSaveSettings:', error);
      toast.error("Failed to save AI settings");
    } finally {
      setIsSaving(false);
    }
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
    setCustomUrl("");
    setUploadedUrl("");
    toast.info("AI settings reset to defaults");
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading AI settings...</div>;
  }

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
        customUrl={customUrl}
        setCustomUrl={setCustomUrl}
        uploadedUrl={uploadedUrl}
        setUploadedUrl={setUploadedUrl}
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
        <Button 
          variant="outline" 
          onClick={handleResetDefaults}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings} 
          className="flex items-center gap-2 bg-[#9b87f5] hover:bg-[#7E69AB]"
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </div>
  );
};

export default AISettings;
