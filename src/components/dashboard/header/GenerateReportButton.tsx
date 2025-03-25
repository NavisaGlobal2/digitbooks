
import { Button } from "@/components/ui/button";

interface GenerateReportButtonProps {
  onClick: () => void;
}

const GenerateReportButton = ({ onClick }: GenerateReportButtonProps) => {
  return (
    <Button 
      className="bg-[#05D166] hover:bg-[#05D166]/90 text-white px-2 sm:px-4 py-1 rounded-md text-xs sm:text-sm hidden sm:flex"
      onClick={onClick}
    >
      Generate Report
    </Button>
  );
};

export default GenerateReportButton;
