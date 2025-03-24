
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Calendar, CreditCard, Database, FileText, HelpCircle, Mail, Shield, Wallet } from "lucide-react";

interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  category: "accounting" | "payment" | "storage" | "communication" | "security";
}

export const ConnectedServicesSettings = () => {
  const [services, setServices] = useState<ConnectedService[]>([
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Connect your accounting data",
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      connected: true,
      lastSync: "Today at 2:30 PM",
      category: "accounting"
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Process credit card payments",
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      connected: true,
      lastSync: "Today at 1:15 PM",
      category: "payment"
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Additional payment processing",
      icon: <Wallet className="h-6 w-6 text-blue-800" />,
      connected: false,
      category: "payment"
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Cloud storage for documents",
      icon: <Database className="h-6 w-6 text-green-600" />,
      connected: true,
      lastSync: "Yesterday at 5:40 PM",
      category: "storage"
    },
    {
      id: "calendar",
      name: "Google Calendar",
      description: "Sync financial deadlines",
      icon: <Calendar className="h-6 w-6 text-red-600" />,
      connected: false,
      category: "communication"
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing integration",
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      connected: false,
      category: "communication"
    },
    {
      id: "two-factor",
      name: "Two-Factor Auth",
      description: "Enhanced account security",
      icon: <Shield className="h-6 w-6 text-green-800" />,
      connected: true,
      lastSync: "Always on",
      category: "security"
    }
  ]);

  const toggleConnection = (id: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, connected: !service.connected } : service
    ));
  };

  const categories = [
    { id: "accounting", label: "Accounting" },
    { id: "payment", label: "Payment Processing" },
    { id: "storage", label: "Storage & Documents" },
    { id: "communication", label: "Communication" },
    { id: "security", label: "Security" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Connected Services</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4" />
          Integration Guide
        </Button>
      </div>

      <p className="text-muted-foreground">
        Connect third-party services to enhance your DigiBooks experience. Integrations sync automatically to keep your data up-to-date.
      </p>

      {categories.map(category => {
        const categoryServices = services.filter(service => service.category === category.id);
        
        return (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <CardTitle>{category.label}</CardTitle>
              <CardDescription>
                {category.id === "accounting" && "Connect your accounting software to sync financial data"}
                {category.id === "payment" && "Process payments directly through DigiBooks"}
                {category.id === "storage" && "Securely store and access your documents"}
                {category.id === "communication" && "Streamline your communications and notifications"}
                {category.id === "security" && "Enhance your account security"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryServices.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                        {service.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{service.name}</p>
                          {service.connected && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        {service.connected && service.lastSync && (
                          <p className="text-xs text-muted-foreground mt-1">Last synced: {service.lastSync}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={service.connected}
                        onCheckedChange={() => toggleConnection(service.id)}
                      />
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                        Configure
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
