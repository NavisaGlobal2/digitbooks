
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BotNameInput from "./appearance/BotNameInput";
import ThemeSelector from "./appearance/ThemeSelector";
import AvatarSelector from "./appearance/AvatarSelector";
import MessageStyleSelector from "./appearance/MessageStyleSelector";

type AppearanceSettingsProps = {
  botName: string;
  setBotName: (name: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  messageStyle: string;
  setMessageStyle: (style: string) => void;
  avatarType: string;
  setAvatarType: (type: string) => void;
  customUrl?: string;
  setCustomUrl?: (url: string) => void;
  uploadedUrl?: string;
  setUploadedUrl?: (url: string) => void;
};

const AppearanceSettings = ({
  botName,
  setBotName,
  theme,
  setTheme,
  messageStyle,
  setMessageStyle,
  avatarType,
  setAvatarType,
  customUrl = "",
  setCustomUrl = () => {},
  uploadedUrl = "",
  setUploadedUrl = () => {}
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
          <BotNameInput botName={botName} setBotName={setBotName} />
          <ThemeSelector theme={theme} setTheme={setTheme} />
        </div>

        <AvatarSelector 
          avatarType={avatarType}
          setAvatarType={setAvatarType}
          theme={theme}
          customUrl={customUrl}
          setCustomUrl={setCustomUrl}
          uploadedUrl={uploadedUrl}
          setUploadedUrl={setUploadedUrl}
        />

        <MessageStyleSelector 
          messageStyle={messageStyle}
          setMessageStyle={setMessageStyle}
        />
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
