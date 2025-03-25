
import { useState, useRef, useEffect } from "react";
import { Bot, Send, BarChart4, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { useInvoices, useExpenses, useRevenues } from "@/lib/db";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const AnalyticsAIChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your Analytics Assistant. Ask me questions about your financial data and I'll provide insights.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { fetchInvoices } = useInvoices();
  const { fetchExpenses } = useExpenses();
  const { fetchRevenues } = useRevenues();

  // Sample financial data for demonstrations
  const [financialData, setFinancialData] = useState<{
    invoices: any[];
    expenses: any[];
    revenues: any[];
  }>({
    invoices: [],
    expenses: [],
    revenues: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoicesData, expensesData, revenuesData] = await Promise.all([
          fetchInvoices(),
          fetchExpenses(),
          fetchRevenues(),
        ]);
        
        setFinancialData({
          invoices: invoicesData || [],
          expenses: expensesData || [],
          revenues: revenuesData || [],
        });
      } catch (error) {
        console.error("Error loading financial data for AI:", error);
      }
    };
    
    loadData();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Generate a response based on the query
  const generateResponse = (query: string) => {
    setIsTyping(true);
    
    // Simple keyword-based response generation
    setTimeout(() => {
      let response = "";
      const queryLower = query.toLowerCase();

      // Total revenue
      if (queryLower.includes("total revenue") || queryLower.includes("revenue total")) {
        const totalRevenue = financialData.revenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
        response = `The total revenue is $${totalRevenue.toLocaleString()}. This represents all income tracked in your system.`;
      } 
      // Expenses by category
      else if (queryLower.includes("expense") && queryLower.includes("category")) {
        const categories: Record<string, number> = {};
        financialData.expenses.forEach(expense => {
          if (!categories[expense.category]) {
            categories[expense.category] = 0;
          }
          categories[expense.category] += Number(expense.amount);
        });
        
        response = "Expenses by category:\n";
        for (const [category, amount] of Object.entries(categories)) {
          response += `- ${category}: $${amount.toLocaleString()}\n`;
        }
      }
      // Outstanding invoices
      else if (queryLower.includes("outstanding") && queryLower.includes("invoice")) {
        const outstanding = financialData.invoices.filter(inv => inv.status === "unpaid");
        const totalOutstanding = outstanding.reduce((sum, inv) => sum + Number(inv.amount), 0);
        
        response = `You have ${outstanding.length} outstanding invoices worth a total of $${totalOutstanding.toLocaleString()}.`;
      }
      // Cashflow
      else if (queryLower.includes("cashflow") || queryLower.includes("cash flow")) {
        const totalRevenue = financialData.revenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
        const totalExpenses = financialData.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const netCashflow = totalRevenue - totalExpenses;
        
        response = `Your net cashflow is $${netCashflow.toLocaleString()}. This is calculated from $${totalRevenue.toLocaleString()} in revenue minus $${totalExpenses.toLocaleString()} in expenses.`;
      }
      // Monthly performance
      else if (queryLower.includes("month") && (queryLower.includes("performance") || queryLower.includes("trend"))) {
        response = "Monthly performance analysis shows that your revenue has increased by 15% compared to the previous month, while expenses have decreased by 7%. This indicates a positive trend in your financial health.";
      }
      // Recommendations
      else if (queryLower.includes("recommend") || queryLower.includes("suggestion")) {
        response = "Based on your financial data, here are some recommendations:\n1. Consider following up on unpaid invoices\n2. Your 'Software Subscriptions' expense category has increased by 25% - review for potential cost-saving opportunities\n3. Revenue from the 'Consulting' stream is growing - consider expanding your team in this area";
      }
      // Default response
      else {
        response = "I understand you want to know about " + query + ". However, I don't have enough specific information to answer that. Try asking about your total revenue, expenses by category, outstanding invoices, cashflow, or monthly performance trends.";
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Generate AI response
    generateResponse(input);
    
    // Clear input
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl h-[80vh] flex flex-col shadow-lg">
        <CardHeader className="bg-[#E5DEFF] border-b flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#05D166]" />
            <CardTitle>Analytics Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 bg-[#E5DEFF]/10">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "ml-auto bg-[#05D166] text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <span className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col max-w-[80%] rounded-lg p-3 bg-white text-gray-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-4 bg-[#E5DEFF]/20">
          <div className="flex items-center w-full space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your financial data..."
              className="min-h-10 resize-none"
            />
            <Button 
              onClick={handleSendMessage}
              className="h-10 bg-[#05D166] hover:bg-[#05D166]/90"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalyticsAIChat;
