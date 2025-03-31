
export type Message = {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
};
