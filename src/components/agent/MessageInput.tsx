
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MicIcon, SendIcon } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
          onClick={handleSend}
          size="icon" 
          className="h-10 w-10 shrink-0 rounded-full bg-[#05D166] hover:bg-[#05D166]/90"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </CardFooter>
  );
};

export default MessageInput;
