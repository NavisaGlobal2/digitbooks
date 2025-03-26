
import { CreditCard, Calendar, Zap, Building, ShoppingBag, Plus, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const BillsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const bills = [
    { icon: Zap, title: "Electricity Bill", daysLeft: 3, amount: 85000, category: "utilities" },
    { icon: Building, title: "Office Rent", daysLeft: 5, amount: 1200000, category: "rent" },
    { icon: CreditCard, title: "SaaS Subscription", daysLeft: 7, amount: 49000, category: "software" },
    { icon: ShoppingBag, title: "Equipment Lease", daysLeft: 12, amount: 299000, category: "office" }
  ];
  
  const filteredBills = bills.filter(bill => 
    bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
        <div className="relative flex-1 w-full">
          <Input
            type="search"
            placeholder="Search bills..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBills.map((bill, index) => (
          <Card key={index} className="border border-border hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <bill.icon className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-medium text-sm mb-1">{bill.title}</p>
                <p className="text-xs text-muted-foreground mb-2">Due in {bill.daysLeft} days</p>
                <p className="font-bold text-base">{formatNaira(bill.amount)}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-green-500 text-xs">Pay bill</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredBills.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No bills found matching your search criteria.</p>
        </div>
      )}
      
      <Button variant="ghost" className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1">
        <span>View all bills</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="font-semibold">Set up recurring bills</h3>
              <p className="text-sm text-gray-500 mt-1">Create recurring bills to track regular expenses</p>
            </div>
            <Button className="mt-3 md:mt-0 bg-green-500 hover:bg-green-600 text-white">
              Set up recurring bills
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillsSection;
