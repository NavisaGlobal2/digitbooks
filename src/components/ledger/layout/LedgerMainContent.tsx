
import { Transaction } from "@/types/ledger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionList from "../TransactionList";

interface LedgerMainContentProps {
  authStatus: string | null;
  isLoading: boolean;
  error: Error | null;
  transactions: Transaction[];
  onEditTransaction: (id: string) => void;
  onAddTransaction: () => void;
}

export const LedgerMainContent = ({
  authStatus,
  isLoading,
  error,
  transactions,
  onEditTransaction,
  onAddTransaction,
}: LedgerMainContentProps) => {
  return (
    <main className="flex-1 overflow-auto p-3 sm:p-6">
      {authStatus === "Not authenticated" && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            You are not authenticated. Please log in to view your transactions.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading transactions</AlertTitle>
          <AlertDescription>
            {error.message || "There was a problem loading your transactions"}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading transaction data...</p>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyTransactionState onAddTransaction={onAddTransaction} />
      ) : (
        <TransactionListContent 
          transactions={transactions} 
          onEditTransaction={onEditTransaction} 
          onAddTransaction={onAddTransaction}
        />
      )}
    </main>
  );
};

const EmptyTransactionState = ({ onAddTransaction }: { onAddTransaction: () => void }) => {
  return (
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
        onClick={onAddTransaction}
      >
        Add transaction
      </Button>
    </div>
  );
};

const TransactionListContent = ({ 
  transactions, 
  onEditTransaction, 
  onAddTransaction 
}: { 
  transactions: Transaction[];
  onEditTransaction: (id: string) => void;
  onAddTransaction: () => void;
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">Transaction History</h2>
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full xs:w-auto"
          onClick={onAddTransaction}
        >
          <span className="hidden xs:inline">Add transaction</span>
          <span className="xs:hidden">Add transaction</span>
        </Button>
      </div>
      
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-full px-3 sm:px-0">
          <TransactionList onEditTransaction={onEditTransaction} />
        </div>
      </div>
    </div>
  );
};
