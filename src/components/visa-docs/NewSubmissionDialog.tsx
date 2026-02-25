import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisaDocs } from "@/contexts/VisaDocsContext";
import { VisaType, VISA_TYPE_LABELS } from "@/types/visaDocs";
import { getAvailableCountries, getAvailableVisaTypes } from "./visaDocumentTemplates";

interface NewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewSubmissionDialog = ({ open, onOpenChange }: NewSubmissionDialogProps) => {
  const { createSubmission } = useVisaDocs();
  const [country, setCountry] = useState("");
  const [visaType, setVisaType] = useState("");
  const [applicantName, setApplicantName] = useState("");

  const countries = getAvailableCountries();
  const availableVisaTypes = country ? getAvailableVisaTypes(country) : [];

  const handleSubmit = () => {
    if (!country || !visaType) return;
    createSubmission(visaType as VisaType, country, applicantName || undefined);
    setCountry("");
    setVisaType("");
    setApplicantName("");
    onOpenChange(false);
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setVisaType("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Visa Submission</DialogTitle>
          <DialogDescription>
            Select the destination country and visa type to get a tailored document checklist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="applicantName">Applicant Name (optional)</Label>
            <Input
              id="applicantName"
              value={applicantName}
              onChange={e => setApplicantName(e.target.value)}
              placeholder="Enter applicant name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Destination Country</Label>
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visaType">Visa Type</Label>
            <Select value={visaType} onValueChange={setVisaType} disabled={!country}>
              <SelectTrigger id="visaType">
                <SelectValue placeholder={country ? "Select visa type" : "Select a country first"} />
              </SelectTrigger>
              <SelectContent>
                {availableVisaTypes.map(vt => (
                  <SelectItem key={vt} value={vt}>{VISA_TYPE_LABELS[vt]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!country || !visaType}>
            Create Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubmissionDialog;
