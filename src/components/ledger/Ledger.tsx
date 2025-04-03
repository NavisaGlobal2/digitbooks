
import { useLedger } from "@/contexts/LedgerContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { AddTransactionDialog } from "@/components/ledger/AddTransactionDialog";
import { EditTransactionDialog } from "./EditTransactionDialog";
import MobileSidebar from "../dashboard/layout/MobileSidebar";
import { LedgerHeader } from "./layout/LedgerHeader";
import { LedgerMainContent } from "./layout/LedgerMainContent";
import { useLedgerPageState } from "./hooks/useLedgerPageState";

const Ledger = () => {
  const { 
    transactions, 
    isLoading, 
    error,
    showAddDialog, 
    setShowAddDialog,
    editTransactionId, 
    setEditTransactionId,
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen,
    isRefreshing,
    authStatus,
    handleEditTransaction,
    handleManualRefresh,
    showDebugInfo
  } = useLedgerPageState();
  
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
        <LedgerHeader 
          isRefreshing={isRefreshing}
          authStatus={authStatus}
          onManualRefresh={handleManualRefresh}
          showDebugInfo={showDebugInfo}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <LedgerMainContent 
          authStatus={authStatus}
          isLoading={isLoading}
          error={error}
          transactions={transactions}
          onEditTransaction={handleEditTransaction}
          onAddTransaction={() => setShowAddDialog(true)}
        />
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
