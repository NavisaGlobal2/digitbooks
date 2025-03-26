import { CreditCard, Calendar, Zap, Building, ShoppingBag, Plus, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BillsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBills, setShowAllBills] = useState(false);
  
  const bills = [
    { icon: Zap, title: "Electricity Bill", daysLeft: 3, amount: 85000, category: "utilities", dueDate: "2023-11-15" },
    { icon: Building, title: "Office Rent", daysLeft: 5, amount: 1200000, category: "rent", dueDate: "2023-11-17" },
    { icon: CreditCard, title: "SaaS Subscription", daysLeft: 7, amount: 49000, category: "software", dueDate: "2023-11-19" },
    { icon: ShoppingBag, title: "Equipment Lease", daysLeft: 12, amount: 299000, category: "office", dueDate: "2023-11-24" },
    { icon: Zap, title: "Internet Bill", daysLeft: 15, amount: 65000, category: "utilities", dueDate: "2023-11-27" },
    { icon: CreditCard, title: "Cloud Services", daysLeft: 18, amount: 120000, category: "software", dueDate: "2023-11-30" },
    { icon: ShoppingBag, title: "Office Supplies", daysLeft: 20, amount: 85000, category: "office", dueDate: "2023-12-02" }
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
        {filteredBills.slice(0, 4).map((bill, index) => (
          <Card key={index} className="border border-border hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <bill.icon className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-medium text-sm mb-1">{bill.title}</p>
                <p className="text-xs text-muted-foreground mb-2">Due in {bill.daysLeft} days</p>
                <p className="font-bold text-base break-words">{formatNaira(bill.amount)}</p>
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
      
      <Button 
        variant="ghost" 
        className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1"
        onClick={() => setShowAllBills(true)}
      >
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

      {/* All Bills Dialog */}
      <Dialog open={showAllBills} onOpenChange={setShowAllBills}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Upcoming Bills</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Due In</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <bill.icon className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{bill.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{bill.category}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell>{bill.daysLeft} days</TableCell>
                    <TableCell className="text-right font-medium break-words">{formatNaira(bill.amount)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-green-500">
                        Pay bill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsSection;
