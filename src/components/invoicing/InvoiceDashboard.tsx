
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/contexts/InvoiceContext";
import { useClients } from "@/contexts/ClientContext";
import InvoiceTabs from "./InvoiceTabs";
import InvoiceEmptyState from "./InvoiceEmptyState";
import ClientEmptyState from "./ClientEmptyState";
import ClientsTable from "../clients/ClientsTable";
import ClientsOverview from "../clients/ClientsOverview";
import { toast } from "sonner";

import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  CalendarRange, 
  Plus,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
  
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const expectedThisMonth = pendingInvoices.filter(inv => 
    inv.dueDate <= endOfMonth && inv.dueDate >= today
  );
  
  const calculateStatusTotal = (invoices: Invoice[]) => {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  };
  
  const overdueTotal = calculateStatusTotal(overdueInvoices);
  const pendingTotal = calculateStatusTotal(pendingInvoices);
  const paidTotal = calculateStatusTotal(paidInvoices);
  const expectedTotal = calculateStatusTotal(expectedThisMonth);
  
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
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };
  
  return (
    <div className="flex flex-col h-full">
      <InvoiceTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="flex-1 py-6">
        {activeTab === "invoices" && (
          <>
            {invoices.length === 0 ? (
              <InvoiceEmptyState onCreateInvoice={() => setIsCreatingInvoice(true)} />
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            )}
          </>
        )}
        
        {activeTab === "clients" && (
          <>
            {clients.length === 0 ? (
              <ClientEmptyState onAddClient={() => setIsAddingClient(true)} />
            ) : (
              <div className="space-y-6">
                <ClientsOverview />
                
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
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setIsAddingClient(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </div>
                
                <ClientsTable searchQuery={searchQuery} />
              </div>
            )}
          </>
        )}
      </div>
      
      <ClientForm open={isAddingClient} onOpenChange={setIsAddingClient} />
    </div>
  );
};

export default InvoiceDashboard;
