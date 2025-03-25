
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BehaviorSettingsProps = {
  autoOpen: boolean;
  setAutoOpen: (value: boolean) => void;
  autoRespond: boolean;
  setAutoRespond: (value: boolean) => void;
  model: string;
  setModel: (value: string) => void;
};

const BehaviorSettings = ({
  autoOpen,
  setAutoOpen,
  autoRespond,
  setAutoRespond,
  model,
  setModel
}: BehaviorSettingsProps) => {
  return (
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
  );
};

export default BehaviorSettings;
