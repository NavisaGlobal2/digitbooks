
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  CalendarRange, 
  Plus,
  ReceiptText,
  Users,
  Clock,
  FileText,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useInvoices } from "@/contexts/InvoiceContext";
import { Invoice, InvoiceStatus } from "@/types/invoice";

interface InvoiceDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const statusStyles = {
    pending: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700"
  };
  
  const statusText = {
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  );
};

const InvoiceDashboard = ({ activeTab, setActiveTab, setIsCreatingInvoice }: InvoiceDashboardProps) => {
  const { invoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  
  useEffect(() => {
    const handleInvoiceCreated = () => {
      // Navigate back to the invoice list
      setIsCreatingInvoice(false);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, [setIsCreatingInvoice]);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvoices(invoices);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = invoices.filter(invoice => 
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
    
    setFilteredInvoices(filtered);
  }, [invoices, searchQuery]);
  
  // Count invoices by status
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  
  // Calculate expected this month (all pending invoices due this month)
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const expectedThisMonth = pendingInvoices.filter(inv => 
    inv.dueDate <= endOfMonth && inv.dueDate >= today
  );
  
  // Calculate totals
  const calculateStatusTotal = (invoices: Invoice[]) => {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  };
  
  const overdueTotal = calculateStatusTotal(overdueInvoices);
  const pendingTotal = calculateStatusTotal(pendingInvoices);
  const paidTotal = calculateStatusTotal(paidInvoices);
  const expectedTotal = calculateStatusTotal(expectedThisMonth);
  
  return (
    <>
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="bg-background border border-border">
          <TabsTrigger 
            value="invoices" 
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="mt-6">
          {/* Invoice Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Overdue invoices</span>
                </div>
                <h3 className="text-3xl font-bold">{formatCurrency(overdueTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{overdueInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Outstanding invoices</span>
                </div>
                <h3 className="text-3xl font-bold">{formatCurrency(pendingTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{pendingInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-500 mb-1">
                  <ArrowDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Paid invoices</span>
                </div>
                <h3 className="text-3xl font-bold">{formatCurrency(paidTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{paidInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-500 mb-1">
                  <CalendarRange className="h-4 w-4" />
                  <span className="text-sm font-medium">Expected this month</span>
                </div>
                <h3 className="text-3xl font-bold">{formatCurrency(expectedTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{expectedThisMonth.length} invoice(s)</p>
              </CardContent>
            </Card>
          </div>
          
          {invoices.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 p-6 rounded-full mb-6 flex items-center justify-center">
                <ReceiptText className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2">No invoices created</h2>
              <p className="text-muted-foreground mb-8">Click on the 'Create Invoice' button to create your first invoice.</p>
              
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white min-w-52"
                onClick={() => setIsCreatingInvoice(true)}
              >
                Create invoice
              </Button>
            </div>
          ) : (
            /* Invoice List */
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-auto flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                  
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setIsCreatingInvoice(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create invoice
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issued date</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{format(invoice.issuedDate, "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(invoice.dueDate, "dd/MM/yyyy")}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="clients" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">No clients added yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md">Add your first client to start creating invoices for them.</p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogTitle>Add New Client</DialogTitle>
                <div className="py-6">
                  <p>Client creation form will be implemented here.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default InvoiceDashboard;
