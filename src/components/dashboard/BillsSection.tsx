
import { CreditCard, ChevronRight, Calendar, Zap, Building, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const BillsSection = () => {
  const bills = [
    { icon: Zap, title: "Electricity Bill", daysLeft: 3, amount: 85 },
    { icon: Building, title: "Office Rent", daysLeft: 5, amount: 1200 },
    { icon: CreditCard, title: "SaaS Subscription", daysLeft: 7, amount: 49 },
    { icon: ShoppingBag, title: "Equipment Lease", daysLeft: 12, amount: 299 }
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <CardTitle className="text-lg font-semibold">Upcoming Bills</CardTitle>
        <Button variant="outline" size="sm" className="text-sm gap-2 h-9">
          <Calendar className="h-4 w-4" />
          This Month
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-4">
          {bills.map((bill, index) => (
            <Card key={index} className="p-4 border border-border hover:border-primary/20 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <bill.icon className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-medium text-sm mb-1">{bill.title}</p>
                <p className="text-xs text-muted-foreground mb-2">Due in {bill.daysLeft} days</p>
                <p className="font-bold text-base">${bill.amount}</p>
              </div>
            </Card>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1">
          <span>View all bills</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default BillsSection;
