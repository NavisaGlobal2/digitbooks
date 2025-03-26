
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BusinessProfileSettings } from "@/components/settings/BusinessProfileSettings";
import { TeamManagementSettings } from "@/components/settings/TeamManagementSettings";
import { ConnectedServicesSettings } from "@/components/settings/ConnectedServicesSettings";
import { InvoiceTemplateSettings } from "@/components/settings/InvoiceTemplateSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AISettings } from "@/components/settings/AISettings";

type SettingsTab = 'business' | 'team' | 'services' | 'invoice' | 'notifications' | 'ai';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const tabs = [
    { id: 'business', label: 'Business profile', icon: '🏢' },
    { id: 'team', label: 'Team management', icon: '👥' },
    { id: 'services', label: 'Connected services', icon: '🔌' },
    { id: 'invoice', label: 'Invoice template', icon: '📄' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold">User Profile and Settings</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="border-b">
          <div className="flex overflow-x-auto scrollbar-hide pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
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

        <div className="p-3 sm:p-6">
          {activeTab === 'business' && <BusinessProfileSettings />}
          {activeTab === 'team' && <TeamManagementSettings />}
          {activeTab === 'services' && <ConnectedServicesSettings />}
          {activeTab === 'invoice' && <InvoiceTemplateSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'ai' && <AISettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
