
import { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  CalendarRange, 
  Plus,
  Receipt,
  ReceiptText,
  FileText,
  Users,
  Clock,
  ChevronLeft,
  ChevronDown,
  Upload,
  Copy
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import Sidebar from "@/components/dashboard/Sidebar";

const InvoiceForm = () => {
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', quantity: 1, price: 0, tax: 0 }]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0, tax: 0 }]);
  };
  
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const calculateTax = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Invoice Form - Made narrower */}
      <div className="w-full lg:w-2/5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-140px)] pr-4">
        {/* Template Selection */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">Select template</h3>
          <div className="grid grid-cols-3 gap-4">
            <div 
              className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "default" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
              onClick={() => setSelectedTemplate("default")}
            >
              <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/37efa1ea-49eb-4e89-8928-6e829c9ac5bd.png" 
                  alt="Default template" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-center mt-2">Default template</p>
            </div>
            <div 
              className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "professional" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
              onClick={() => setSelectedTemplate("professional")}
            >
              <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/64229911-f907-4630-9ee3-54dd7ef51e21.png" 
                  alt="Professional template" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-center mt-2">Professional template</p>
            </div>
            <div 
              className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "minimalist" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
              onClick={() => setSelectedTemplate("minimalist")}
            >
              <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
                <FileText className="text-gray-400" size={48} />
              </div>
              <p className="text-sm text-center mt-2">Minimalist template</p>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">Upload logo</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">Drag & drop file here</p>
            <p className="text-sm text-gray-500 mb-3">or</p>
            <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-50">
              Browse files
            </Button>
          </div>
        </div>

        {/* Business Details Section */}
        <div className="bg-white p-6 rounded-lg border border-border space-y-4">
          {/* Invoice Number */}
          <div>
            <h3 className="text-lg font-medium mb-2">Invoice number</h3>
            <div className="relative">
              <Input placeholder="INV-001" />
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Client Selection */}
          <div className="pt-2">
            <h3 className="text-lg font-medium mb-2">Select client</h3>
            <div className="relative mb-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">Amarachhhlii LTD</SelectItem>
                  <SelectItem value="client2">Client 2</SelectItem>
                  <SelectItem value="client3">Client 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-50 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create client
            </Button>
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <Label htmlFor="invoice-date">Invoice date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="due-date">Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="pt-2">
            <Label htmlFor="payment-terms">Payment terms</Label>
            <Select defaultValue="full">
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">100% upon project completion</SelectItem>
                <SelectItem value="50-50">50% upfront, 50% upon completion</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Itemized Products/Services */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-4">Itemized products/services</h3>
          {invoiceItems.map((item, index) => (
            <div key={index} className="mb-4 border border-gray-200 rounded-md p-4">
              <div className="mb-4">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input id={`description-${index}`} placeholder="Web design services" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input 
                    id={`quantity-${index}`} 
                    type="number" 
                    min="1" 
                    defaultValue="1" 
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Price</Label>
                  <Input 
                    id={`price-${index}`} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                  />
                </div>
                <div>
                  <Label htmlFor={`tax-${index}`}>Tax (%)</Label>
                  <Input 
                    id={`tax-${index}`} 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.1" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`total-${index}`}>Total</Label>
                <Input 
                  id={`total-${index}`} 
                  readOnly 
                  value="$0.00"
                />
              </div>
            </div>
          ))}
          <Button 
            variant="outline" 
            className="text-green-500 border-green-500 hover:bg-green-50 w-full"
            onClick={addInvoiceItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add more
          </Button>
        </div>

        {/* Additional Info */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <Label htmlFor="additional-info">Additional information</Label>
          <Textarea 
            id="additional-info" 
            placeholder="Enter notes or additional information for your client"
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Invoice Preview - Made larger and sticky */}
      <div className="w-full lg:w-3/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-xl font-medium mb-4">Invoice preview</h3>
          <div className="border rounded-lg p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold">INVOICE</h1>
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400">Logo</span>
              </div>
            </div>
            
            <div className="flex justify-between mb-10">
              <div>
                <h4 className="font-medium mb-2 text-lg">Billed to</h4>
                <p>Client name</p>
                <p>Client email</p>
                <p>Company address</p>
                <p>City, Country - 00000</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">Business name</p>
                <p>youremail@example.com</p>
                <p>Business address</p>
                <p>City, State, IN - 000 000</p>
                <p>TAX ID 00XXXXX1234XXXX</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-5 font-medium text-sm border-b pb-2">
                <div>Invoice #</div>
                <div>Description</div>
                <div className="text-center">Qty</div>
                <div className="text-right">Price</div>
                <div className="text-right">Total</div>
              </div>
              
              <div className="grid grid-cols-5 py-4 border-b text-sm">
                <div>INV-001</div>
                <div>Web design service</div>
                <div className="text-center">1</div>
                <div className="text-right">$3,000.00</div>
                <div className="text-right">$3,000.00</div>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <p className="font-medium mb-2">Invoice date</p>
                <p>{invoiceDate ? format(invoiceDate, "dd MMM, yyyy") : "01 Jan, 2023"}</p>
                
                <p className="font-medium mt-4 mb-2">Due date</p>
                <p>{dueDate ? format(dueDate, "dd MMM, yyyy") : "15 Jan, 2023"}</p>
              </div>
              
              <div className="text-right w-1/3">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>$3,000.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t mt-3 text-lg">
                  <span>Total due</span>
                  <span>$3,000.00</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-5">
              <p className="font-medium mb-2">Payment terms</p>
              <p>100% upon project completion</p>
              <div className="flex items-start mt-3">
                <input type="checkbox" className="mt-1 mr-2" />
                <p className="text-sm">Please pay within 15 days of receiving this invoice.</p>
              </div>
            </div>

            <div className="border-t mt-6 pt-5">
              <p className="font-medium mb-2">Payment details</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>Bank name</p>
                  <p>IBAN/Account #</p>
                  <p>Swift code</p>
                </div>
                <div>
                  <p>ABCD BANK</p>
                  <p>3747489 2300011</p>
                  <p>ABCDUSBBXXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Invoicing = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-white flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {isCreatingInvoice ? (
              <>
                <button 
                  onClick={() => setIsCreatingInvoice(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold">Create invoice</h1>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-semibold">Invoicing</h1>
              </>
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto px-6 py-6">
          {isCreatingInvoice ? (
            <InvoiceForm />
          ) : (
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
                        <h3 className="text-3xl font-bold">#0</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                          <ArrowRight className="h-4 w-4" />
                          <span className="text-sm font-medium">Outstanding invoices</span>
                        </div>
                        <h3 className="text-3xl font-bold">#0</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-500 mb-1">
                          <ArrowDown className="h-4 w-4" />
                          <span className="text-sm font-medium">Cashed invoices</span>
                        </div>
                        <h3 className="text-3xl font-bold">#0</h3>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-purple-500 mb-1">
                          <CalendarRange className="h-4 w-4" />
                          <span className="text-sm font-medium">Expected this month</span>
                        </div>
                        <h3 className="text-3xl font-bold">#0</h3>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Empty State */}
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
          )}
        </main>
      </div>
    </div>
  );
};

export default Invoicing;
