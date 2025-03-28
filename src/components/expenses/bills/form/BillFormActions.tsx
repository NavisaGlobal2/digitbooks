
import { Button } from "@/components/ui/button";

interface BillFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const BillFormActions = ({ onCancel, isSubmitting }: BillFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Bill"}
      </Button>
    </div>
  );
};

export default BillFormActions;
