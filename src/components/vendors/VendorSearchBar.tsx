
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VendorSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddVendor: () => void;
}

const VendorSearchBar = ({ searchQuery, setSearchQuery, onAddVendor }: VendorSearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vendors..."
          className="w-full pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button onClick={onAddVendor}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Vendor
      </Button>
    </div>
  );
};

export default VendorSearchBar;
