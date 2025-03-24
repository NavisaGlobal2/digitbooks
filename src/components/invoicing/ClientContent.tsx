
import { useClients } from "@/contexts/ClientContext";
import ClientEmptyState from "./ClientEmptyState";
import ClientsOverview from "../clients/ClientsOverview";
import ClientSearchBar from "./ClientSearchBar";
import ClientsTable from "../clients/ClientsTable";

interface ClientContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAddingClient: (value: boolean) => void;
}

const ClientContent = ({ 
  searchQuery, 
  setSearchQuery, 
  setIsAddingClient 
}: ClientContentProps) => {
  const { clients } = useClients();
  
  if (clients.length === 0) {
    return <ClientEmptyState onAddClient={() => setIsAddingClient(true)} />;
  }
  
  return (
    <div className="space-y-6">
      <ClientsOverview />
      
      <ClientSearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddClient={() => setIsAddingClient(true)}
      />
      
      <ClientsTable searchQuery={searchQuery} />
    </div>
  );
};

export default ClientContent;
