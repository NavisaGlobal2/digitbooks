
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Message } from "@/types/agent";

interface AgentChatCardProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
}

const AgentChatCard = ({ messages, isTyping, onSendMessage }: AgentChatCardProps) => {
  return (
    <Card className="flex-1 flex flex-col h-[calc(100vh-240px)] mb-6 shadow-md border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Financial Insights Assistant
        </CardTitle>
        <Separator />
      </CardHeader>
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput onSendMessage={onSendMessage} />
    </Card>
  );
};

export default AgentChatCard;
