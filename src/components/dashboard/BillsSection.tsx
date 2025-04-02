
import { useState, useEffect } from "react";
import { CreditCard, ChevronRight, Calendar, Zap, Building, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import BillsDialog from "@/components/expenses/bills/BillsDialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionFrequency } from "@/types/recurringTransaction";
import { getCategoryIcon, calculateDaysLeft } from "@/components/expenses/bills/billsUtils";
import { toast } from "sonner";

// Define the Bill type for internal use
interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  icon: any;
  daysLeft: number;
  frequency: TransactionFrequency;
}

const BillsSection = () => {
  const [showAllBills, setShowAllBills] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("thisMonth");
  
  const fetchBills = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current date
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Fetch recurring transactions (bills) from Supabase
      const { data, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('transaction_type', 'expense')
        .eq('status', 'active')
        .lte('next_due_date', endOfMonth.toISOString())
        .order('next_due_date', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        // Format the data to match our Bill interface
        const formattedBills = data.map((transaction: any) => {
          const daysLeft = transaction.next_due_date ? calculateDaysLeft(transaction.next_due_date) : 0;
          const categoryName = transaction.category_id || 'other';
          
          return {
            id: transaction.id,
            title: transaction.description,
            amount: transaction.amount,
            dueDate: transaction.next_due_date ? new Date(transaction.next_due_date).toISOString().split('T')[0] : '',
            category: categoryName,
            icon: getCategoryIcon(categoryName),
            daysLeft: daysLeft,
            frequency: transaction.frequency as TransactionFrequency
          };
        });
        
        // Sort by days left (ascending)
        formattedBills.sort((a, b) => a.daysLeft - b.daysLeft);
        
        // Only take the first 4 for display
        setBills(formattedBills.slice(0, 4));
      } else {
        // If no bills found, use some default fallback bills
        setBills([
          { id: '1', title: "Electricity Bill", amount: 85, dueDate: "2023-11-10", category: "utilities", icon: Zap, daysLeft: 3, frequency: "monthly" },
          { id: '2', title: "Office Rent", amount: 1200, dueDate: "2023-11-12", category: "rent", icon: Building, daysLeft: 5, frequency: "monthly" },
          { id: '3', title: "SaaS Subscription", amount: 49, dueDate: "2023-11-14", category: "software", icon: CreditCard, daysLeft: 7, frequency: "monthly" },
          { id: '4', title: "Equipment Lease", amount: 299, dueDate: "2023-11-19", category: "other", icon: ShoppingBag, daysLeft: 12, frequency: "monthly" }
        ]);
      }
    } catch (err: any) {
      console.error("Error fetching bills:", err);
      setError(err.message || "Failed to load bills");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayBill = (billId: string, billTitle: string, amount: number, frequency: TransactionFrequency) => {
    // In a dashboard view, we just show a toast
    toast.info(`Payment for ${billTitle} would be initiated here`);
    // Close the dialog
    setShowAllBills(false);
  };

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 pt-4 md:pt-6 px-4 md:px-6">
        <CardTitle className="text-lg font-semibold mb-2 sm:mb-0">Upcoming Bills</CardTitle>
        <Button variant="outline" size="sm" className="text-sm gap-2 h-9 w-full sm:w-auto">
          <Calendar className="h-4 w-4" />
          This Month
        </Button>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="p-4 border border-border">
                <div className="flex flex-col items-center text-center">
                  <Skeleton className="w-10 h-10 rounded-full mb-3" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>{error}</p>
            <Button 
              variant="ghost" 
              className="mt-2"
              onClick={fetchBills}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="p-4 border border-border hover:border-primary/20 transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <bill.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="font-medium text-sm mb-1">{bill.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {bill.daysLeft <= 0 ? "Due today" : `Due in ${bill.daysLeft} days`}
                  </p>
                  <p className="font-bold text-base">{formatNaira(bill.amount)}</p>
                </div>
              </Card>
            ))}
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
      </CardContent>
      
      {/* All Bills Dialog */}
      <BillsDialog
        open={showAllBills}
        onOpenChange={setShowAllBills}
        bills={bills}
        onPayBill={handlePayBill}
      />
    </Card>
  );
};

export default BillsSection;
