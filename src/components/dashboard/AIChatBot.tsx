
import { useState } from "react";
import { Bot, X, ChevronUp, ChevronDown, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI assistant. How can I help you with your finances today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responseMessages = [
        "Based on your recent transactions, you could save about $150 monthly by reducing dining expenses.",
        "I've noticed your revenue has increased by 15% this quarter. Great job!",
        "Your cash flow is looking healthy. Would you like me to suggest some investment options?",
        "You have 3 pending invoices that are past due. Would you like me to send reminders?",
        "Your business expenses in the 'Software Subscriptions' category have increased by 20% since last month.",
      ];

      const randomResponse = responseMessages[Math.floor(Math.random() * responseMessages.length)];

      const botResponse: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      toast.success("New AI insight available");
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={toggleOpen}
          className="rounded-full h-14 w-14 bg-[#05D166] hover:bg-[#05D166]/90 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className={cn(
          "w-80 shadow-lg transition-all duration-300 ease-in-out border border-[#05D166]/20",
          isMinimized ? "h-16" : "h-96"
        )}>
          <CardHeader className="px-4 py-2 flex flex-row items-center justify-between bg-[#E5DEFF] border-b">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-[#05D166]">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/lovable-uploads/a24925e2-43db-4889-a722-45a1c1440051.png" />
              </Avatar>
              <CardTitle className="text-sm font-medium">DigiBooks AI</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-6 w-6">
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-4 overflow-y-auto h-[calc(100%-8rem)] bg-[#E5DEFF]/20">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%] rounded-lg p-3",
                        msg.sender === "user"
                          ? "ml-auto bg-[#05D166] text-white"
                          : "bg-white text-gray-800"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                </div>
              </CardContent>

              <CardFooter className="p-2 border-t bg-[#E5DEFF]/10">
                <div className="flex items-center w-full space-x-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me about your finances..."
                    className="min-h-8 resize-none text-sm"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    className="h-8 w-8 bg-[#05D166] hover:bg-[#05D166]/90"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIChatBot;
