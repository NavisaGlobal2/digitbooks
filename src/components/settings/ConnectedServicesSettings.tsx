
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
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base sm:text-lg font-medium">Connected Services</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1 self-start">
          <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Integration Guide</span>
        </Button>
      </div>

      <p className="text-muted-foreground text-xs sm:text-sm">
        Connect third-party services to enhance your DigiBooks experience. Integrations sync automatically to keep your data up-to-date.
      </p>

      {categories.map(category => {
        const categoryServices = services.filter(service => service.category === category.id);
        
        return (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg">{category.label}</CardTitle>
              <CardDescription className="text-xs">
                {category.id === "accounting" && "Connect your accounting software to sync financial data"}
                {category.id === "payment" && "Process payments directly through DigiBooks"}
                {category.id === "storage" && "Securely store and access your documents"}
                {category.id === "communication" && "Streamline your communications and notifications"}
                {category.id === "security" && "Enhance your account security"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {categoryServices.map(service => (
                  <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        {service.icon}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <p className="font-medium text-xs sm:text-sm">{service.name}</p>
                          {service.connected && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                        {service.connected && service.lastSync && (
                          <p className="text-xs text-muted-foreground mt-1">Last synced: {service.lastSync}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-1 sm:mt-0">
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
