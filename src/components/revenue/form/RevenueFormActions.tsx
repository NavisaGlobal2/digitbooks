
import { Button } from "@/components/ui/button";

interface RevenueFormActionsProps {
  onCancel: () => void;
  isEdit: boolean;
}

const RevenueFormActions = ({ onCancel, isEdit }: RevenueFormActionsProps) => {
  return (
    <div className="flex justify-between gap-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="flex-1 h-12"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="flex-1 h-12 bg-[#05D166] hover:bg-[#05D166]/80 text-white"
      >
        {isEdit ? "Update revenue" : "Save revenue"}
      </Button>
    </div>
  );
};

export default RevenueFormActions;
