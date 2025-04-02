
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface TeamMemberSearchProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  totalCount: number;
  filteredCount: number;
}

export const TeamMemberSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  totalCount, 
  filteredCount 
}: TeamMemberSearchProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {filteredCount === totalCount ? (
          <span>Showing all {totalCount} team members</span>
        ) : (
          <span>
            Showing {filteredCount} of {totalCount} team members
          </span>
        )}
      </div>
    </div>
  );
};
