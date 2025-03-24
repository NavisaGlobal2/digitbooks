
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BillsSection = () => {
  return (
    <Card className="p-6 border-none shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Subscription</p>
                <p className="text-sm text-muted-foreground">Due in {Math.floor(Math.random() * 10) + 1} days</p>
              </div>
            </div>
            <p className="font-medium">
              ${(Math.floor(Math.random() * 100) + 20).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4 text-primary">
        View all bills
      </Button>
    </Card>
  );
};

export default BillsSection;
