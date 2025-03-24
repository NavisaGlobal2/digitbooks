
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InvoiceDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceDashboard = ({ activeTab, setActiveTab, setIsCreatingInvoice }: InvoiceDashboardProps) => {
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
  );
};

export default InvoiceDashboard;
