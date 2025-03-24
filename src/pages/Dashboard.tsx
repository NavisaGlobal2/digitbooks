
import { ArrowDown, ArrowRight, ArrowUp, BarChart, FileText, Filter, LayoutGrid, Search } from "lucide-react";
import { useState } from "react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import CashflowChart from "@/components/dashboard/CashflowChart";

const Dashboard = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  // Sample data for our dashboard
  const financialData = {
    totalRevenue: 24828,
    totalExpenses: 24828,
    netCashflow: 24828,
    positive: true
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-white">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">DB</span>
            </div>
            <span className="font-semibold text-lg">DigiBooks</span>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 p-2 bg-accent/10 text-primary font-medium rounded-md">
              <LayoutGrid className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <FileText className="h-5 w-5" />
              Invoicing
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <ArrowDown className="h-5 w-5" />
              Expense tracking
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <ArrowUp className="h-5 w-5" />
              Revenue tracking
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <BarChart className="h-5 w-5" />
              Budgeting tools
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <BarChart className="h-5 w-5" />
              Financial Reports
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-secondary hover:bg-muted rounded-md">
              <FileText className="h-5 w-5" />
              General ledger
            </a>
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
              <img 
                src="https://i.pravatar.cc/32" 
                alt="User avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-sm">Amarachi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Hi Amarachi, let's get organized</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search transactions, invoices, reports..." 
                  className="pl-10 pr-4 py-2 rounded-full border border-input bg-white w-72 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button className="bg-success text-white px-6 py-2 rounded-full hover:bg-success/90 transition-colors">
                Generate report
              </button>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <button className="flex items-center gap-2 p-4 border border-border rounded-lg bg-white hover:shadow-sm transition-shadow">
              <FileText className="h-5 w-5 text-primary" />
              <span>Create invoice</span>
            </button>
            <button className="flex items-center gap-2 p-4 border border-border rounded-lg bg-white hover:shadow-sm transition-shadow">
              <ArrowDown className="h-5 w-5 text-primary" />
              <span>Track expense</span>
            </button>
            <button className="flex items-center gap-2 p-4 border border-border rounded-lg bg-white hover:shadow-sm transition-shadow">
              <ArrowUp className="h-5 w-5 text-primary" />
              <span>Manage revenue</span>
            </button>
            <button className="flex items-center gap-2 p-4 border border-border rounded-lg bg-white hover:shadow-sm transition-shadow">
              <FileText className="h-5 w-5 text-primary" />
              <span>General ledger</span>
            </button>
          </div>

          {/* Filter */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Financial overview</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5 bg-white text-sm">
                {filterPeriod}
                <Filter className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5" />
                  <span className="font-medium">Total Revenue</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">{financialData.totalRevenue.toLocaleString()}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-1 bg-muted rounded">
                  <ArrowUp className="h-3 w-3" />
                </div>
                Cash inflow
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5" />
                  <span className="font-medium">Total expenses</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">{financialData.totalExpenses.toLocaleString()}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-1 bg-muted rounded">
                  <ArrowDown className="h-3 w-3" />
                </div>
                Cash outflow
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  <span className="font-medium">Net cashflow</span>
                </div>
              </div>
              <h3 className={`text-3xl font-bold mb-2 ${financialData.positive ? 'text-success' : 'text-error'}`}>
                {financialData.netCashflow.toLocaleString()}
              </h3>
              <div className="flex items-center gap-2 text-sm text-success">
                <div className="p-1 bg-success/10 rounded">
                  <ArrowUp className="h-3 w-3 text-success" />
                </div>
                Positive cashflow
              </div>
            </div>
          </div>

          {/* Cashflow Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Cashflow analysis</h2>
            <div className="border border-border rounded-lg p-4 bg-white">
              <div className="h-[300px]">
                <CashflowChart />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4">Expense breakdown</h2>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Coming soon
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4">Revenue sources</h2>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Coming soon
              </div>
            </div>
          </div>

          {/* AI Help Button */}
          <div className="fixed bottom-6 right-6">
            <button className="bg-success text-white rounded-full p-4 shadow-lg hover:bg-success/90 transition-colors">
              <span className="font-medium">Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
