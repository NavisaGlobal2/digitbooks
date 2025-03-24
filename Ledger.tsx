import { useState } from "react";
import { useLedger } from "@/contexts/LedgerContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AddTransactionDialog } from "@/components/ledger/AddTransactionDialog";

const Ledger = () => {
  const { transactions } = useLedger();
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">General ledger</h1>
          </div>
          
          {transactions.length > 0 && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowAddDialog(true)}
            >
              Add transaction
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          {transactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
              <div className="w-48 h-48 mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <BookOpen className="w-24 h-24 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2">You have no transaction record yet.</h2>
              <p className="text-muted-foreground mb-8">
                Click on the 'Add transaction' button to create your first revenue entry.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setShowAddDialog(true)}
              >
                Add transaction
              </Button>
            </div>
          ) : (
            <div>
              {/* Transaction list and details will go here */}
            </div>
          )}
        </main>
      </div>

      <AddTransactionDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default Ledger;