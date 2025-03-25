
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type InstructionsSettingsProps = {
  botPrompt: string;
  setBotPrompt: (value: string) => void;
};

const InstructionsSettings = ({
  botPrompt,
  setBotPrompt
}: InstructionsSettingsProps) => {
  return (
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
  );
};

export default InstructionsSettings;
