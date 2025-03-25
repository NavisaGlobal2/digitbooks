
import { AISettingsForm, AISettingsActions, useAISettingsForm } from "./ai/SettingsForm";
import AppearanceSettings from "./ai/AppearanceSettings";
import BehaviorSettings from "./ai/BehaviorSettings";
import InstructionsSettings from "./ai/InstructionsSettings";

export const AISettings = () => {
  const {
    formValues,
    updateFormValue,
    isLoading,
    isSaving,
    handleSaveSettings,
    handleResetDefaults
  } = useAISettingsForm();

  return (
    <AISettingsForm isLoading={isLoading}>
      <AppearanceSettings 
        botName={formValues.botName}
        setBotName={(value) => updateFormValue('botName', value)}
        theme={formValues.theme}
        setTheme={(value) => updateFormValue('theme', value)}
        messageStyle={formValues.messageStyle}
        setMessageStyle={(value) => updateFormValue('messageStyle', value)}
        avatarType={formValues.avatarType}
        setAvatarType={(value) => updateFormValue('avatarType', value)}
        customUrl={formValues.customUrl}
        setCustomUrl={(value) => updateFormValue('customUrl', value)}
        uploadedUrl={formValues.uploadedUrl}
        setUploadedUrl={(value) => updateFormValue('uploadedUrl', value)}
      />

      <BehaviorSettings
        autoOpen={formValues.autoOpen}
        setAutoOpen={(value) => updateFormValue('autoOpen', value)}
        autoRespond={formValues.autoRespond}
        setAutoRespond={(value) => updateFormValue('autoRespond', value)}
        model={formValues.model}
        setModel={(value) => updateFormValue('model', value)}
      />

      <InstructionsSettings
        botPrompt={formValues.botPrompt}
        setBotPrompt={(value) => updateFormValue('botPrompt', value)}
      />

      <AISettingsActions 
        isSaving={isSaving}
        onReset={handleResetDefaults}
        onSave={handleSaveSettings}
      />
    </AISettingsForm>
  );
};

export default AISettings;
