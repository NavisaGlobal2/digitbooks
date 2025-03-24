
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { JobApplicationForm } from "./JobApplicationForm";
import { useState } from "react";

interface JobApplicationModalProps {
  jobTitle: string;
  jobDepartment: string;
}

export function JobApplicationModal({ jobTitle, jobDepartment }: JobApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="bg-[#05D166] hover:bg-[#05D166]/80 text-primary group"
        >
          Apply Now
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <JobApplicationForm 
          jobTitle={jobTitle} 
          jobDepartment={jobDepartment} 
          onSubmitSuccess={() => setIsOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}
