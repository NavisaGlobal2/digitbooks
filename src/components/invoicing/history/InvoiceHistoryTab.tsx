
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, FileText, Trash } from "lucide-react";
import { toast } from "sonner";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  getInvoiceHistory, 
  deleteInvoiceFromHistory,
  getInvoiceHistoryFromDB, 
  InvoiceHistoryItem
} from "@/services/invoiceHistoryService";
import { formatNaira } from "@/utils/invoice/formatters";
import { useAuth } from "@/contexts/auth";

const InvoiceHistoryTab = () => {
  const [historyItems, setHistoryItems] = useState<InvoiceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Try to get history from database first if user is authenticated
      let history: InvoiceHistoryItem[] = [];
      
      if (isAuthenticated) {
        history = await getInvoiceHistoryFromDB();
      }
      
      // Fall back to localStorage if needed
      if (history.length === 0) {
        history = getInvoiceHistory();
      }
      
      setHistoryItems(history);
    } catch (error) {
      console.error("Error loading invoice history:", error);
      toast.error("Failed to load invoice history");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = (fileName: string) => {
    try {
      deleteInvoiceFromHistory(fileName);
      setHistoryItems(prev => prev.filter(item => item.fileName !== fileName));
      toast.success("Invoice deleted from history");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading invoice history...
      </div>
    );
  }
  
  if (historyItems.length === 0) {
    return (
      <div className="py-12 text-center border rounded-md bg-muted/20">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
        <h3 className="text-lg font-medium">No invoice history found</h3>
        <p className="text-muted-foreground">
          Your downloaded invoices will appear here
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Invoice History</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadHistory}
        >
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(item.date), "dd MMM yyyy")}</TableCell>
                <TableCell>{item.clientName}</TableCell>
                <TableCell>{item.invoiceNumber}</TableCell>
                <TableCell className="text-right">{formatNaira(item.amount)}</TableCell>
                <TableCell>
                  <span className={`inline-block capitalize px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'receipt' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.fileName)}
                      title="Delete"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceHistoryTab;
