
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/settings/ui/ColorPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export const InvoiceTemplateSettings = () => {
  const [activeTemplate, setActiveTemplate] = useState("classic");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [logoPosition, setLogoPosition] = useState("left");
  const [footerText, setFooterText] = useState("Thank you for your business!");
  const [showPaymentQR, setShowPaymentQR] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [fontSize, setFontSize] = useState([14]);
  const [font, setFont] = useState("inter");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Invoice Template</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Customize how your invoices look to clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="design" className="text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">Design</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">Templates</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm">Primary Color</Label>
                  <ColorPicker 
                    color={primaryColor} 
                    onChange={setPrimaryColor}
                  />
                </div>
                
                <div>
                  <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm">Accent Color</Label>
                  <ColorPicker 
                    color={accentColor} 
                    onChange={setAccentColor}
                  />
                </div>
                
                <div>
                  <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm">Font Family</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter" className="text-xs sm:text-sm">Inter</SelectItem>
                      <SelectItem value="roboto" className="text-xs sm:text-sm">Roboto</SelectItem>
                      <SelectItem value="montserrat" className="text-xs sm:text-sm">Montserrat</SelectItem>
                      <SelectItem value="opensans" className="text-xs sm:text-sm">Open Sans</SelectItem>
                      <SelectItem value="lato" className="text-xs sm:text-sm">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm">Font Size</Label>
                  <div className="pt-4">
                    <Slider
                      value={fontSize}
                      min={10}
                      max={18}
                      step={1}
                      onValueChange={setFontSize}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>10px</span>
                      <span>{fontSize}px</span>
                      <span>18px</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-1 sm:mb-2 block text-xs sm:text-sm">Logo Position</Label>
                  <Select value={logoPosition} onValueChange={setLogoPosition}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left" className="text-xs sm:text-sm">Left</SelectItem>
                      <SelectItem value="center" className="text-xs sm:text-sm">Center</SelectItem>
                      <SelectItem value="right" className="text-xs sm:text-sm">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {["classic", "modern", "minimal", "professional", "creative"].map(template => (
                  <div 
                    key={template}
                    className={`border rounded-lg p-2 sm:p-3 cursor-pointer transition-all hover:border-primary ${activeTemplate === template ? 'border-primary ring-2 ring-primary ring-opacity-20' : ''}`}
                    onClick={() => setActiveTemplate(template)}
                  >
                    <div className="aspect-[11/8] bg-gray-100 rounded mb-2 sm:mb-3 flex items-center justify-center">
                      <span className="capitalize text-xs sm:text-sm text-gray-500">{template}</span>
                    </div>
                    <h3 className="capitalize font-medium text-xs sm:text-sm">{template}</h3>
                    <p className="text-xs sm:text-xs text-muted-foreground">
                      {template === "classic" && "Traditional invoice layout"}
                      {template === "modern" && "Clean and contemporary design"}
                      {template === "minimal" && "Simplified, elegant format"}
                      {template === "professional" && "Business-oriented template"}
                      {template === "creative" && "Unique, standout design"}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="footer-text" className="text-xs sm:text-sm">Custom Footer Message</Label>
                <Input 
                  id="footer-text" 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Enter a message to display at the bottom of invoices"
                  className="mt-1 sm:mt-1.5 text-xs sm:text-sm"
                />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-payment-qr" className="font-medium text-xs sm:text-sm">Payment QR Code</Label>
                    <p className="text-xs text-muted-foreground">Show scannable payment QR code</p>
                  </div>
                  <Switch 
                    id="show-payment-qr"
                    checked={showPaymentQR}
                    onCheckedChange={setShowPaymentQR}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-due-date" className="font-medium text-xs sm:text-sm">Due Date Emphasis</Label>
                    <p className="text-xs text-muted-foreground">Highlight payment due date</p>
                  </div>
                  <Switch 
                    id="show-due-date"
                    checked={showDueDate}
                    onCheckedChange={setShowDueDate}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-bank-details" className="font-medium text-xs sm:text-sm">Bank Details</Label>
                    <p className="text-xs text-muted-foreground">Display bank account information</p>
                  </div>
                  <Switch 
                    id="show-bank-details"
                    checked={showBankDetails}
                    onCheckedChange={setShowBankDetails}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 border-t pt-4 sm:pt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">Reset to Default</Button>
            <Button size="sm" className="text-xs sm:text-sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
