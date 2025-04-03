
import { useState, useEffect, useCallback } from "react";
import { useLedger } from "@/contexts/LedgerContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { BookOpen, ArrowLeft, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AddTransactionDialog } from "@/components/ledger/AddTransactionDialog";
import TransactionList from "./TransactionList";
import { EditTransactionDialog } from "./EditTransactionDialog";
import MobileSidebar from "../dashboard/layout/MobileSidebar";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Ledger = () => {
  const { transactions, isLoading, refreshTransactions, error } = useLedger();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const MAX_AUTO_REFRESH_ATTEMPTS = 1;

  const refreshData = useCallback(async () => {
    if (refreshAttempts >= MAX_AUTO_REFRESH_ATTEMPTS) {
      console.log("Max auto-refresh attempts reached");
      return;
    }

    try {
      setIsRefreshing(true);
      setRefreshAttempts(prev => prev + 1);
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransactions, refreshAttempts]);

  useEffect(() => {
    // Only try to auto-refresh when loading completes
    if (!isLoading && refreshAttempts === 0) {
      refreshData();
    }
  }, [isLoading, refreshData, refreshAttempts]);

  const handleEditTransaction = (id: string) => {
    setEditTransactionId(id);
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshAttempts(0); // Reset attempts counter for manual refresh
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="md:hidden text-muted-foreground p-1"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold">General ledger</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs sm:text-sm flex items-center gap-1"
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error loading transactions</AlertTitle>
              <AlertDescription>
                There was a problem loading your transactions. Please check your 
                connection or try again later.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading transaction data...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center px-4">
              <div className="w-32 h-32 sm:w-48 sm:h-48 mb-6 sm:mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">You have no transaction record yet.</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
                Click on the 'Add transaction' button to create your first revenue entry.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                onClick={() => setShowAddDialog(true)}
              >
                Add transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold">Transaction History</h2>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full xs:w-auto"
                  onClick={() => setShowAddDialog(true)}
                >
                  <span className="hidden xs:inline">Add transaction</span>
                  <span className="xs:hidden">Add transaction</span>
                </Button>
              </div>
              
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-full px-3 sm:px-0">
                  <TransactionList onEditTransaction={handleEditTransaction} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddTransactionDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
      
      <EditTransactionDialog 
        open={!!editTransactionId}
        onOpenChange={(open) => {
          if (!open) setEditTransactionId(null);
        }}
        transactionId={editTransactionId}
      />
    </div>
  );
};

export default Ledger;
