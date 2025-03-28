
import { useState, useEffect } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTransaction, TransactionFrequency } from "@/types/recurringTransaction";
import BillsSearchBar from "./bills/BillsSearchBar";
import BillCard from "./bills/BillCard";
import EmptyBillsState from "./bills/EmptyBillsState";
import BillsLoadingSkeleton from "./bills/BillsLoadingSkeleton";
import BillsDialog from "./bills/BillsDialog";
import RecurringBillsBanner from "./bills/RecurringBillsBanner";
import AddBillDialog from "./bills/AddBillDialog";
import BillPaymentDialog from "./bills/BillPaymentDialog";
import { getCategoryIcon, getCategoryName, calculateDaysLeft } from "./bills/billsUtils";

// Define the Bill type that we'll use internally
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBills, setShowAllBills] = useState(false);
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<{id: string, title: string, amount: number, frequency: TransactionFrequency} | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bills from the database
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
        // Format the data to match our Bill interface
        const formattedBills = data.map((transaction: any) => {
          const daysLeft = transaction.next_due_date ? calculateDaysLeft(transaction.next_due_date) : 0;
          const categoryName = getCategoryName(transaction.category_id);
          
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
  
  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter(bill => 
    bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBill = () => {
    setShowAddBillDialog(true);
  };

  const handleBillAdded = () => {
    fetchBills();
  };

  const handlePayBill = (billId: string, billTitle: string, amount: number, frequency: TransactionFrequency) => {
    setSelectedBill({
      id: billId,
      title: billTitle,
      amount: amount,
      frequency: frequency
    });
    setShowPaymentDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
        <BillsSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
          onClick={handleAddBill}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>
      
      {isLoading ? (
        <BillsLoadingSkeleton />
      ) : filteredBills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBills.slice(0, 4).map((bill) => (
            <BillCard
              key={bill.id}
              id={bill.id}
              title={bill.title}
              amount={bill.amount}
              daysLeft={bill.daysLeft}
              icon={bill.icon}
              frequency={bill.frequency}
              onPayBill={handlePayBill}
            />
          ))}
        </div>
      ) : (
        <EmptyBillsState
          searchQuery={searchQuery}
          onAddBill={handleAddBill}
        />
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
      
      <RecurringBillsBanner onSetupRecurring={handleAddBill} />

      {/* All Bills Dialog */}
      <BillsDialog
        open={showAllBills}
        onOpenChange={setShowAllBills}
        bills={filteredBills}
        onPayBill={handlePayBill}
      />

      {/* Add Bill Dialog */}
      <AddBillDialog
        open={showAddBillDialog}
        onOpenChange={setShowAddBillDialog}
        onBillAdded={handleBillAdded}
      />

      {/* Payment Dialog */}
      {selectedBill && (
        <BillPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          billId={selectedBill.id}
          billTitle={selectedBill.title}
          amount={selectedBill.amount}
          frequency={selectedBill.frequency}
          onPaymentSuccess={fetchBills}
        />
      )}
    </div>
  );
};

export default BillsSection;
