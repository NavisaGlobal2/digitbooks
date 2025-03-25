
import { useState, useRef, useEffect } from "react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, MicIcon, Bot, ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "welcome",
    content: "Hello! I'm your DigiBooks AI Agent. How can I assist you with your financial data and analytics today?",
    sender: "agent",
    timestamp: new Date(),
  },
];

const Agent = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const responseOptions = [
        "Based on your financial data, your revenue has increased by 12% this quarter compared to last quarter.",
        "Looking at your expense breakdown, the largest category is 'Salaries' at 31.5% of your total expenses.",
        "I notice you have 3 unpaid invoices that are overdue. Would you like me to generate reminders?",
        "Your cash flow trend shows a positive trajectory over the last 6 months, with a 15% increase overall.",
        "I can help you optimize your budget allocations. Your marketing expenses seem higher than industry average.",
        "Your current financial health score is 82/100, which is considered strong. However, I see opportunities to improve your liquidity ratio.",
        "Would you like me to prepare a financial forecast for the next quarter based on your current trends?",
      ];

      const agentMessage: Message = {
        id: Date.now().toString(),
        content: responseOptions[Math.floor(Math.random() * responseOptions.length)],
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
      toast.success("New insight from your financial agent");
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    toast.success("Conversation has been reset");
  };

  return (
    <DashboardContainer>
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")} 
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            DigiBooks AI Agent
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="ml-auto flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <Card className="flex-1 flex flex-col h-[calc(100vh-240px)] mb-6 shadow-md border border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Financial Insights Assistant
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pb-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className={message.sender === "agent" ? "bg-primary/10" : "bg-secondary/10"}>
                      <AvatarFallback>
                        {message.sender === "agent" ? "AI" : "U"}
                      </AvatarFallback>
                      {message.sender === "agent" && (
                        <AvatarImage src="/lovable-uploads/a24925e2-43db-4889-a722-45a1c1440051.png" />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-[#05D166] text-white"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <Avatar className="bg-primary/10">
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/lovable-uploads/a24925e2-43db-4889-a722-45a1c1440051.png" />
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted/50">
                      <div className="flex space-x-2 items-center h-5">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150"></div>
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="pt-3">
            <div className="flex w-full gap-2 items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-full"
              >
                <MicIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Input
                placeholder="Ask me about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-full bg-[#05D166] hover:bg-[#05D166]/90"
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardContainer>
  );
};

export default Agent;
