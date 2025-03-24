
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/contexts/ClientContext";

const ClientsOverview = () => {
  const { clients } = useClients();
  
  // Calculate client statistics
  const activeClients = clients.filter(client => client.status === 'active').length;
  const newClients = clients.filter(client => {
    // Consider clients created in the last 30 days as new
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(client.createdAt) >= thirtyDaysAgo;
  }).length;
  const totalClients = clients.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">New clients</p>
            <h3 className="text-3xl font-bold">{newClients}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active clients</p>
            <h3 className="text-3xl font-bold">{activeClients}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total clients</p>
            <h3 className="text-3xl font-bold">{totalClients}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsOverview;
