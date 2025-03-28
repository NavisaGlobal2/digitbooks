
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BillsSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const BillsSearchBar = ({ searchQuery, setSearchQuery }: BillsSearchBarProps) => {
  return (
    <div className="relative flex-1 w-full">
      <Input
        type="search"
        placeholder="Search bills..."
        className="pl-9 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Filter className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

export default BillsSearchBar;
