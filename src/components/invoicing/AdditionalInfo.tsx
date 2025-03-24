
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalInfoProps {
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
}

const AdditionalInfo = ({ additionalInfo, setAdditionalInfo }: AdditionalInfoProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <Label htmlFor="additional-info">Additional information</Label>
      <Textarea 
        id="additional-info" 
        placeholder="Enter payment instructions or additional information for your client"
        className="min-h-[100px]"
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
      />
    </div>
  );
};

export default AdditionalInfo;
