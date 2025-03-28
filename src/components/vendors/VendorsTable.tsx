
import { formatNaira } from "@/utils/invoice/formatters";
import { Vendor } from "@/types/vendor";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Building, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

interface VendorsTableProps {
  vendors: Vendor[];
  onViewVendor: (id: string) => void;
  searchQuery: string;
  onSearch: Dispatch<SetStateAction<string>>;
}

const VendorsTable = ({ vendors, onViewVendor, searchQuery, onSearch }: VendorsTableProps) => {
  if (vendors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No vendors found matching your search criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="hidden md:table-cell">Last Transaction</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Building className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      {vendor.email && (
                        <p className="text-xs text-gray-500 hidden sm:block">{vendor.email}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{formatNaira(vendor.totalSpent)}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{vendor.lastTransaction ? new Date(vendor.lastTransaction).toLocaleDateString() : "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => onViewVendor(vendor.id)}
                  >
                    <span className="sr-only">View vendor</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VendorsTable;
