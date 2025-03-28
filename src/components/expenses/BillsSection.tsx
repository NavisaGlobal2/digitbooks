
import { useState, useEffect } from "react";
import { CreditCard, Calendar, Zap, Building, ShoppingBag, Plus, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the Bill type
interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  icon: any;
  daysLeft: number;
}

// Map category to icon
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'utilities': return Zap;
    case 'rent': return Building;
    case 'software': return CreditCard;
    case 'office': return ShoppingBag;
    default: return CreditCard;
  }
};

const BillsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBills, setShowAllBills] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to calculate days left
  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Load bills from the database
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        // Try to fetch bills from recurring_transactions where transaction_type is 'expense'
        const { data, error } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('transaction_type', 'expense')
          .order('next_due_date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedBills = data.map(bill => {
            const daysLeft = bill.next_due_date ? calculateDaysLeft(bill.next_due_date) : 0;
            return {
              id: bill.id,
              title: bill.description,
              amount: bill.amount,
              dueDate: bill.next_due_date ? new Date(bill.next_due_date).toISOString().split('T')[0] : '',
              category: bill.category || 'other',
              icon: getCategoryIcon(bill.category || 'other'),
              daysLeft: daysLeft
            };
          });
          setBills(formattedBills);
        } else {
          setBills([]);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
        toast.error("Failed to load bills");
        setBills([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBills();
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBill = () => {
    toast.info("Add bill functionality will be implemented soon!");
  };

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
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
          onClick={handleAddBill}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index} className="border border-border animate-pulse">
              <CardContent className="p-4 h-[140px]">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBills.slice(0, 4).map((bill) => (
            <Card key={bill.id} className="border border-border hover:border-primary/20 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <bill.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="font-medium text-sm mb-1">{bill.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {bill.daysLeft > 0 ? `Due in ${bill.daysLeft} days` : 'Due today'}
                  </p>
                  <p className="font-bold text-base break-words">{formatNaira(bill.amount)}</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-green-500 text-xs">Pay bill</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery ? 'No bills match your search criteria.' : 'You don\'t have any upcoming bills to display.'}
          </p>
          <Button 
            onClick={handleAddBill}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Bill
          </Button>
        </div>
      )}
      
      {filteredBills.length > 0 && (
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1"
          onClick={() => setShowAllBills(true)}
        >
          <span>View all bills</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="font-semibold">Set up recurring bills</h3>
              <p className="text-sm text-gray-500 mt-1">Create recurring bills to track regular expenses</p>
            </div>
            <Button 
              className="mt-3 md:mt-0 bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddBill}
            >
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
          {filteredBills.length > 0 ? (
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
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
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
                      <TableCell>
                        {bill.daysLeft > 0 ? `${bill.daysLeft} days` : 'Due today'}
                      </TableCell>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bills found matching your search criteria.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsSection;
