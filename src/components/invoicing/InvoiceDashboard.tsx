
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
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useClients } from "@/contexts/ClientContext";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice";
import { downloadInvoice, shareInvoice } from "@/utils/invoice";
import ClientForm from "@/components/clients/ClientForm";

interface InvoiceDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

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
  const navigate = useNavigate();
  const { invoices, updateInvoiceStatus } = useInvoices();
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  
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
  
  // Handle invoice actions
  const handleDownloadInvoice = async (invoice: Invoice) => {
    await downloadInvoice({
      logoPreview: invoice.logoUrl || null,
      invoiceItems: invoice.items,
      invoiceDate: invoice.issuedDate,
      dueDate: invoice.dueDate,
      additionalInfo: invoice.additionalInfo || "",
      bankName: invoice.bankDetails.bankName,
      accountNumber: invoice.bankDetails.accountNumber,
      swiftCode: invoice.bankDetails.swiftCode,
      accountName: invoice.bankDetails.accountName,
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber
    });
  };
  
  const handleShareInvoice = async (invoice: Invoice) => {
    await shareInvoice({
      logoPreview: invoice.logoUrl || null,
      invoiceItems: invoice.items,
      invoiceDate: invoice.issuedDate,
      dueDate: invoice.dueDate,
      additionalInfo: invoice.additionalInfo || "",
      bankName: invoice.bankDetails.bankName,
      accountNumber: invoice.bankDetails.accountNumber,
      swiftCode: invoice.bankDetails.swiftCode,
      accountName: invoice.bankDetails.accountName,
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber
    });
  };
  
  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, 'paid');
  };
  
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
                <h3 className="text-3xl font-bold">{formatNaira(overdueTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{overdueInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Outstanding invoices</span>
                </div>
                <h3 className="text-3xl font-bold">{formatNaira(pendingTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{pendingInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-500 mb-1">
                  <ArrowDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Paid invoices</span>
                </div>
                <h3 className="text-3xl font-bold">{formatNaira(paidTotal)}</h3>
                <p className="text-sm text-gray-500 mt-1">{paidInvoices.length} invoice(s)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-500 mb-1">
                  <CalendarRange className="h-4 w-4" />
                  <span className="text-sm font-medium">Expected this month</span>
                </div>
                <h3 className="text-3xl font-bold">{formatNaira(expectedTotal)}</h3>
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
                        <TableCell>{format(new Date(invoice.issuedDate), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="text-right">{formatNaira(invoice.amount)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)} className="cursor-pointer">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareInvoice(invoice)} className="cursor-pointer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              {invoice.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)} className="cursor-pointer">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
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
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-6 flex items-center justify-center">
                <Users className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2">No clients added yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md">Add your first client to start creating invoices for them.</p>
              
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setIsAddingClient(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">New clients</p>
                      <h3 className="text-3xl font-bold">
                        {clients.filter(client => {
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return new Date(client.createdAt) >= thirtyDaysAgo;
                        }).length}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active clients</p>
                      <h3 className="text-3xl font-bold">
                        {clients.filter(client => client.status === 'active').length}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total clients</p>
                      <h3 className="text-3xl font-bold">{clients.length}</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Search and Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-auto flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
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
                    onClick={() => navigate("/clients")} 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Clients
                  </Button>
                  
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setIsAddingClient(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </div>
              
              {/* Client Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client name</TableHead>
                      <TableHead>Email address</TableHead>
                      <TableHead>Total invoices</TableHead>
                      <TableHead>Total amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients
                      .filter(client => 
                        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        client.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 5) // Show only first 5 clients for preview
                      .map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.invoiceCount}</TableCell>
                          <TableCell>{formatNaira(client.totalAmount)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {client.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View client</DropdownMenuItem>
                                <DropdownMenuItem>Edit details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setIsCreatingInvoice(true);
                                  setActiveTab("invoices");
                                }}>
                                  Create invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete client</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              
              {clients.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    className="text-primary"
                    onClick={() => navigate("/clients")}
                  >
                    View all clients
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Client Form Dialog */}
      <ClientForm open={isAddingClient} onOpenChange={setIsAddingClient} />
    </>
  );
};

export default InvoiceDashboard;
