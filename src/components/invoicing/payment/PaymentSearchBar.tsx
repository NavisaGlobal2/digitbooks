
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaymentSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PaymentSearchBar = ({ searchQuery, setSearchQuery }: PaymentSearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="w-full md:w-1/2 lg:w-1/3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSearchBar;
