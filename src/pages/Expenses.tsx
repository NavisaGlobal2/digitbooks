
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import Sidebar from "@/components/dashboard/Sidebar";
import ExpenseEmptyState from "@/components/expenses/ExpenseEmptyState";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  Download,
  FileEdit,
  Trash2,
  Receipt,
  PieChart,
  TrendingUp,
  CreditCard,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpenseCategory } from "@/types/expense";
import { formatNaira } from "@/utils/invoice";

const ExpensesPage = () => {
  const { expenses, deleteExpense, getTotalExpenses, getExpensesByCategory } = useExpenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  const handleAddExpense = () => {
    setShowExpenseDialog(true);
  };
  
  const handleConnectBank = () => {
    toast.info("Bank connection functionality coming soon!");
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category totals
  const categoryTotals = getExpensesByCategory();
  
  // Get total monthly expenses
  const totalExpenses = getTotalExpenses();
  
  // Calculate top spending categories
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ 
      category: category as ExpenseCategory, 
      amount 
    }));
  
  // Helper function to get a user-friendly category name
  const getCategoryLabel = (category: ExpenseCategory): string => {
    const categoryMap: Record<ExpenseCategory, string> = {
      office: "Office Supplies",
      travel: "Travel",
      meals: "Meals & Entertainment",
      utilities: "Utilities",
      rent: "Rent",
      software: "Software",
      hardware: "Hardware",
      marketing: "Marketing",
      salaries: "Salaries",
      taxes: "Taxes",
      other: "Other"
    };
    
    return categoryMap[category] || category;
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Expenses</h1>
            
            {expenses.length > 0 && (
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleAddExpense}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {isAddingExpense ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
              <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
            </div>
          ) : (
            <>
              {expenses.length === 0 ? (
                <ExpenseEmptyState 
                  onAddExpense={handleAddExpense} 
                  onConnectBank={handleConnectBank} 
                />
              ) : (
                <div className="space-y-6">
                  {/* Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-500 mb-1">
                          <Receipt className="h-4 w-4" />
                          <span className="text-sm font-medium">Total Expenses</span>
                        </div>
                        <h3 className="text-3xl font-bold">{formatNaira(totalExpenses)}</h3>
                        <p className="text-sm text-gray-500 mt-1">{expenses.length} expense(s)</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                          <PieChart className="h-4 w-4" />
                          <span className="text-sm font-medium">Top Category</span>
                        </div>
                        <h3 className="text-2xl font-bold truncate">
                          {topCategories.length > 0 ? getCategoryLabel(topCategories[0].category) : "N/A"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {topCategories.length > 0 ? formatNaira(topCategories[0].amount) : "₦0.00"}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-purple-500 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">This Month</span>
                        </div>
                        <h3 className="text-3xl font-bold">{formatNaira(totalExpenses)}</h3>
                        <p className="text-sm text-gray-500 mt-1">vs. ₦0 last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium">Payment Method</span>
                        </div>
                        <h3 className="text-3xl font-bold">{expenses.filter(e => e.paymentMethod === 'card').length}</h3>
                        <p className="text-sm text-gray-500 mt-1">Card transactions</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                      <div className="relative w-full md:w-auto flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search expenses..."
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
                          onClick={handleAddExpense}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                              <TableCell className="font-medium">{expense.description}</TableCell>
                              <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                              <TableCell>{expense.vendor}</TableCell>
                              <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                              <TableCell className="text-right">{formatNaira(expense.amount)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {expense.receiptUrl && (
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Download className="h-4 w-4 mr-2" />
                                        View Receipt
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="cursor-pointer">
                                      <FileEdit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-red-500 focus:text-red-500"
                                      onClick={() => handleDeleteExpense(expense.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
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
        </main>
      </div>
      
      {/* Add expense dialog */}
      <AddExpenseDialog 
        open={showExpenseDialog} 
        onOpenChange={setShowExpenseDialog} 
      />
    </div>
  );
};

export default ExpensesPage;
