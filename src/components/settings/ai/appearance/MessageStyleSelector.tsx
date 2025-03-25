
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type MessageStyleSelectorProps = {
  messageStyle: string;
  setMessageStyle: (value: string) => void;
};

const MessageStyleSelector = ({ 
  messageStyle, 
  setMessageStyle 
}: MessageStyleSelectorProps) => {
  return (
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
  );
};

export default MessageStyleSelector;
