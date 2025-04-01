
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RevenueFormActionsProps {
  onCancel: () => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

const RevenueFormActions = ({ onCancel, isEdit = false, isSubmitting = false }: RevenueFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEdit ? 'Saving...' : 'Adding...'}
          </>
        ) : (
          isEdit ? 'Save changes' : 'Add revenue'
        )}
      </Button>
    </div>
  );
};

export default RevenueFormActions;
