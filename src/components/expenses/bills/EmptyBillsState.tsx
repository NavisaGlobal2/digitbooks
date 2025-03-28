
import { ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyBillsStateProps {
  searchQuery: string;
  onAddBill: () => void;
}

const EmptyBillsState = ({ searchQuery, onAddBill }: EmptyBillsStateProps) => {
  return (
    <div className="text-center py-12 border rounded-lg bg-gray-50">
      <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-4">
        {searchQuery ? 'No bills match your search criteria.' : 'You don\'t have any upcoming bills to display.'}
      </p>
      <Button 
        onClick={onAddBill}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Bill
      </Button>
    </div>
  );
};

export default EmptyBillsState;
