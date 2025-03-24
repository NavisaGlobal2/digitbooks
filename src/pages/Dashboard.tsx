
import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  BarChart, 
  FileText, 
  Filter, 
  LayoutGrid, 
  Search, 
  Settings,
  User,
  CreditCard,
  Bell
} from "lucide-react";
import { useState } from "react";
import CashflowChart from "@/components/dashboard/CashflowChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 14418,
    netCashflow: 10410,
    positive: true
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[240px] h-screen border-r border-border py-4 flex flex-col">
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">DB</span>
            </div>
            <span className="font-semibold text-lg">DigiBooks</span>
          </div>
        </div>
        
        <div className="flex-1 px-2">
          <nav className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-primary font-medium bg-accent/10"
            >
              <LayoutGrid className="h-5 w-5" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <FileText className="h-5 w-5" />
              Invoicing
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <ArrowDown className="h-5 w-5" />
              Expenses
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <ArrowUp className="h-5 w-5" />
              Revenue
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <BarChart className="h-5 w-5" />
              Reports
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <CreditCard className="h-5 w-5" />
              Banking
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-secondary"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="px-4 mt-auto">
          <div className="flex items-center gap-3 p-2">
            <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden">
              <img 
                src="https://i.pravatar.cc/36" 
                alt="User avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Amarachi</p>
              <p className="text-xs text-muted-foreground">Premium plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-border px-6 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search for transactions, invoices..." 
              className="pl-10 pr-4 py-2 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-secondary" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-secondary" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">Good morning, Amarachi!</h1>
                <p className="text-secondary">Here's what's happening with your finances today.</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button className="bg-success text-white hover:bg-success/90">
                  + Add Transaction
                </Button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <Card className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#f0f9ff] to-[#e6f7ff] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium text-secondary">Total Revenue</p>
                      <Badge variant="info" className="bg-blue-100 text-blue-600 hover:bg-blue-100">+14.5%</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">${financialData.totalRevenue.toLocaleString()}</h3>
                    <p className="text-muted-foreground text-sm">Compared to $21,490 last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#fff7f5] to-[#fff0eb] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium text-secondary">Total Expenses</p>
                      <Badge variant="error" className="bg-red-100 text-red-600 hover:bg-red-100">-3.2%</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">${financialData.totalExpenses.toLocaleString()}</h3>
                    <p className="text-muted-foreground text-sm">Compared to $14,900 last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-[#f6f9ff] to-[#edf2ff] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-medium text-secondary">Net Cashflow</p>
                      <Badge variant="success" className="bg-green-100 text-green-600 hover:bg-green-100">+7.8%</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">${financialData.netCashflow.toLocaleString()}</h3>
                    <p className="text-muted-foreground text-sm">Compared to $9,580 last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cashflow Analysis */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Cashflow Analysis</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-sm">
                    {filterPeriod}
                    <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <Card className="p-6 border-none shadow-sm">
                <div className="h-[350px]">
                  <CashflowChart />
                </div>
              </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-5">
              <Card className="p-6 border-none shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {i % 2 === 0 ? 
                            <ArrowDown className="h-5 w-5 text-green-600" /> : 
                            <ArrowUp className="h-5 w-5 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{i % 2 === 0 ? 'Income' : 'Expense'}</p>
                          <p className="text-sm text-muted-foreground">May 10, 2023</p>
                        </div>
                      </div>
                      <p className={`font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {i % 2 === 0 ? '+' : '-'}${(Math.floor(Math.random() * 1000) + 200).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary">
                  View all transactions
                </Button>
              </Card>
              
              <Card className="p-6 border-none shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Subscription</p>
                          <p className="text-sm text-muted-foreground">Due in {Math.floor(Math.random() * 10) + 1} days</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ${(Math.floor(Math.random() * 100) + 20).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary">
                  View all bills
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
