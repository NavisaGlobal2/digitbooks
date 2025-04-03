
import { Link } from "react-router-dom";
import { ArrowLeft, Bug, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LedgerHeaderProps {
  isRefreshing: boolean;
  authStatus: string | null;
  onManualRefresh: () => Promise<void>;
  showDebugInfo: () => void;
  onOpenMobileSidebar: () => void;
}

export const LedgerHeader = ({
  isRefreshing,
  authStatus,
  onManualRefresh,
  showDebugInfo,
  onOpenMobileSidebar,
}: LedgerHeaderProps) => {
  return (
    <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="md:hidden text-muted-foreground p-1"
          onClick={onOpenMobileSidebar}
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
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={showDebugInfo}
          className="text-xs sm:text-sm flex items-center gap-1"
          title="Show debugging information"
        >
          <Bug className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Debug</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onManualRefresh}
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
      </div>
    </header>
  );
};
