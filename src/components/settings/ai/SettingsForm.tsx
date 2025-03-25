
import { useState, useEffect } from "react";
import { Bot, Save, RefreshCw } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AISettingsFormProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

export interface AISettingsFormValues {
  botName: string;
  botPrompt: string;
  autoOpen: boolean;
  theme: string;
  messageStyle: string;
  autoRespond: boolean;
  model: string;
  avatarType: string;
  customUrl: string;
  uploadedUrl: string;
}

export const useAISettingsForm = () => {
  const [formValues, setFormValues] = useState<AISettingsFormValues>({
    botName: "DigitBooks AI",
    botPrompt: "You are a helpful finance assistant. Help users with their accounting and financial questions.",
    autoOpen: false,
    theme: "purple",
    messageStyle: "bubble",
    autoRespond: false,
    model: "standard",
    avatarType: "bot",
    customUrl: "",
    uploadedUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to view settings");
          setIsLoading(false);
          return;
        }

        // Use the correct table name as defined in our schema
        const { data, error } = await supabase
          .from('ai_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching AI settings:', error);
          toast.error('Failed to load AI settings');
          return;
        }
        
        if (data) {
          setFormValues({
            botName: data.bot_name || "DigitBooks AI",
            botPrompt: data.bot_prompt || "You are a helpful finance assistant. Help users with their accounting and financial questions.",
            autoOpen: data.auto_open || false,
            theme: data.theme || "purple",
            messageStyle: data.message_style || "bubble",
            autoRespond: data.auto_respond || false,
            model: data.model || "standard",
            avatarType: data.avatar_type || "bot",
            customUrl: data.custom_url || "",
            uploadedUrl: data.uploaded_url || "",
          });
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
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save settings");
        setIsSaving(false);
        return;
      }

      const settings = {
        user_id: user.id, // Add the user ID to link settings to the user
        bot_name: formValues.botName,
        bot_prompt: formValues.botPrompt,
        auto_open: formValues.autoOpen,
        theme: formValues.theme,
        message_style: formValues.messageStyle,
        auto_respond: formValues.autoRespond,
        model: formValues.model,
        avatar_type: formValues.avatarType,
        custom_url: formValues.customUrl,
        uploaded_url: formValues.uploadedUrl,
        updated_at: new Date().toISOString(),
      };

      // Use the correct table name for the upsert
      const { error } = await supabase
        .from('ai_settings')
        .upsert(settings);

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
    setFormValues({
      botName: "DigitBooks AI",
      botPrompt: "You are a helpful finance assistant. Help users with their accounting and financial questions.",
      autoOpen: false,
      theme: "purple",
      messageStyle: "bubble",
      autoRespond: false,
      model: "standard",
      avatarType: "bot",
      customUrl: "",
      uploadedUrl: "",
    });
    toast.info("AI settings reset to defaults");
  };

  const updateFormValue = <K extends keyof AISettingsFormValues>(
    key: K,
    value: AISettingsFormValues[K]
  ) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    formValues,
    updateFormValue,
    isLoading,
    isSaving,
    handleSaveSettings,
    handleResetDefaults
  };
};

export const AISettingsForm = ({ children, isLoading }: AISettingsFormProps) => {
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading AI settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">AI Assistant Settings</h3>
          <p className="text-sm text-muted-foreground">
            Customize how the DigitBooks AI assistant works for you
          </p>
        </div>
        <Bot className="h-8 w-8 text-[#05D166]" />
      </div>

      {children}
    </div>
  );
};

export const AISettingsActions = ({ 
  isSaving, 
  onReset, 
  onSave 
}: { 
  isSaving: boolean; 
  onReset: () => void; 
  onSave: () => void; 
}) => {
  return (
    <CardFooter className="flex justify-between px-0">
      <Button 
        variant="outline" 
        onClick={onReset}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset to Defaults
      </Button>
      <Button 
        onClick={onSave} 
        className="flex items-center gap-2 bg-[#05D166] hover:bg-[#05D166]/80"
        disabled={isSaving}
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>
    </CardFooter>
  );
};
