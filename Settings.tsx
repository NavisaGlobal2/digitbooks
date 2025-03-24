import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { BusinessProfileSettings } from "@/components/settings/BusinessProfileSettings";
import { TeamManagementSettings } from "@/components/settings/TeamManagementSettings";
import { ConnectedServicesSettings } from "@/components/settings/ConnectedServicesSettings";
import { InvoiceTemplateSettings } from "@/components/settings/InvoiceTemplateSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

type SettingsTab = 'business' | 'team' | 'services' | 'invoice' | 'notifications';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const tabs = [
    { id: 'business', label: 'Business profile', icon: '🏢' },
    { id: 'team', label: 'Team management', icon: '👥' },
    { id: 'services', label: 'Connected services', icon: '🔌' },
    { id: 'invoice', label: 'Invoice template', icon: '📄' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ] as const;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">User Profile and Settings</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="border-b">
            <div className="flex px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'business' && <BusinessProfileSettings />}
            {activeTab === 'team' && <TeamManagementSettings />}
            {activeTab === 'services' && <ConnectedServicesSettings />}
            {activeTab === 'invoice' && <InvoiceTemplateSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;