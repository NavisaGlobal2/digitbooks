
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecurringBillsBannerProps {
  onSetupRecurring: () => void;
}

const RecurringBillsBanner = ({ onSetupRecurring }: RecurringBillsBannerProps) => {
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="font-semibold">Set up recurring bills</h3>
            <p className="text-sm text-gray-500 mt-1">Create recurring bills to track regular expenses</p>
          </div>
          <Button 
            className="mt-3 md:mt-0 bg-green-500 hover:bg-green-600 text-white"
            onClick={onSetupRecurring}
          >
            Set up recurring bills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringBillsBanner;
