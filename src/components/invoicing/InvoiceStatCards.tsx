
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowRight, CalendarRange, Clock } from "lucide-react";

interface InvoiceStatCardsProps {
  invoices: Invoice[];
}

const InvoiceStatCards = ({ invoices }: InvoiceStatCardsProps) => {
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

  return (
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
  );
};

export default InvoiceStatCards;
