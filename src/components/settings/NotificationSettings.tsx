
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  category: "invoices" | "payments" | "expenses" | "system";
}

export const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: "invoice-created",
      title: "Invoice Created",
      description: "When a new invoice is created",
      email: true,
      push: true,
      sms: false,
      category: "invoices"
    },
    {
      id: "invoice-paid",
      title: "Invoice Paid",
      description: "When a client pays an invoice",
      email: true,
      push: true,
      sms: true,
      category: "payments"
    },
    {
      id: "invoice-overdue",
      title: "Invoice Overdue",
      description: "When an invoice becomes overdue",
      email: true,
      push: true,
      sms: true,
      category: "invoices"
    },
    {
      id: "payment-received",
      title: "Payment Received",
      description: "When you receive a payment",
      email: true,
      push: true,
      sms: true,
      category: "payments"
    },
    {
      id: "expense-added",
      title: "Expense Added",
      description: "When a new expense is added",
      email: false,
      push: true,
      sms: false,
      category: "expenses"
    },
    {
      id: "recurring-expense",
      title: "Recurring Expense",
      description: "For recurring expense reminders",
      email: true,
      push: true,
      sms: false,
      category: "expenses"
    },
    {
      id: "security-alert",
      title: "Security Alert",
      description: "Important security notifications",
      email: true,
      push: true,
      sms: true,
      category: "system"
    },
    {
      id: "system-updates",
      title: "System Updates",
      description: "New features and improvements",
      email: true,
      push: false,
      sms: false,
      category: "system"
    }
  ]);

  const [emailDigest, setEmailDigest] = useState("daily");

  const categories = [
    { id: "invoices", label: "Invoices" },
    { id: "payments", label: "Payments" },
    { id: "expenses", label: "Expenses" },
    { id: "system", label: "System" }
  ];

  const updateNotificationSetting = (id: string, channel: "email" | "push" | "sms", value: boolean) => {
    setNotificationSettings(
      notificationSettings.map(setting => 
        setting.id === id ? { ...setting, [channel]: value } : setting
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you'd like to be notified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <h3 className="font-medium mb-2">Email Digest</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get a summary of your activities
                </p>
                <RadioGroup value={emailDigest} onValueChange={setEmailDigest}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">No digest</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium mb-2">Notification Methods</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your notification channels
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing-emails">Marketing emails</Label>
                    <Switch id="marketing-emails" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications">Browser notifications</Label>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS notifications</Label>
                    <Switch id="sms-notifications" />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {categories.map(category => {
              const categorySettings = notificationSettings.filter(setting => setting.category === category.id);
              
              return (
                <div key={category.id} className="pt-4">
                  <h3 className="font-medium capitalize mb-3">{category.label}</h3>
                  
                  <div className="grid gap-6">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                      <div className="col-span-1">Notification</div>
                      <div className="text-center">Email</div>
                      <div className="text-center">Push</div>
                      <div className="text-center">SMS</div>
                    </div>
                    
                    {categorySettings.map(setting => (
                      <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-t">
                        <div className="col-span-1">
                          <p className="font-medium">{setting.title}</p>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <div className="flex justify-center">
                          <Switch 
                            checked={setting.email}
                            onCheckedChange={(checked) => updateNotificationSetting(setting.id, "email", checked)}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch 
                            checked={setting.push}
                            onCheckedChange={(checked) => updateNotificationSetting(setting.id, "push", checked)}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch 
                            checked={setting.sms}
                            onCheckedChange={(checked) => updateNotificationSetting(setting.id, "sms", checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-end mt-6 pt-6 border-t">
              <Button>Save Preferences</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
