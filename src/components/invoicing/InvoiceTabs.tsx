
import { MouseEvent } from "react";
import { FileText, Users } from "lucide-react";

interface InvoiceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const InvoiceTabs = ({ activeTab, onTabChange }: InvoiceTabsProps) => {
  const handleTabClick = (e: MouseEvent<HTMLButtonElement>, tab: string) => {
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
      <div className="flex">
        <button
          onClick={(e) => handleTabClick(e, "invoices")}
          className={`flex items-center px-3 sm:px-6 py-3 text-sm sm:text-base ${
            activeTab === "invoices"
              ? "text-green-500 border-b-2 border-green-500 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Invoices
        </button>
        
        <button
          onClick={(e) => handleTabClick(e, "clients")}
          className={`flex items-center px-3 sm:px-6 py-3 text-sm sm:text-base ${
            activeTab === "clients"
              ? "text-green-500 border-b-2 border-green-500 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Clients
        </button>
      </div>
    </div>
  );
};

export default InvoiceTabs;
