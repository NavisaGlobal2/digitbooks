
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BotNameInputProps = {
  botName: string;
  setBotName: (name: string) => void;
};

const BotNameInput = ({ botName, setBotName }: BotNameInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bot-name">Assistant Name</Label>
      <Input
        id="bot-name"
        value={botName}
        onChange={(e) => setBotName(e.target.value)}
        placeholder="DigiBooks AI"
      />
    </div>
  );
};

export default BotNameInput;
