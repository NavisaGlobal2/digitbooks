
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TeamMemberSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TeamMemberSearch = ({
  searchQuery,
  onSearchChange,
}: TeamMemberSearchProps) => {
  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search team members..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
