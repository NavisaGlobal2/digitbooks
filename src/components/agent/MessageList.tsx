
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/types/agent";
import { useRef, useEffect } from "react";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList = ({ messages, isTyping }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
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
  );
};

export default MessageList;
