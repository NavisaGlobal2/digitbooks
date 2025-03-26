
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Invoice Template</CardTitle>
          <CardDescription className="text-xs">
            Customize how your invoices look to clients
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="design" className="text-xs py-1.5 px-1 sm:py-2 sm:px-3">Design</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs py-1.5 px-1 sm:py-2 sm:px-3">Templates</TabsTrigger>
              <TabsTrigger value="content" className="text-xs py-1.5 px-1 sm:py-2 sm:px-3">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block text-xs">Primary Color</Label>
                  <ColorPicker 
                    color={primaryColor} 
                    onChange={setPrimaryColor}
                  />
                </div>
                
                <div>
                  <Label className="mb-1 block text-xs">Accent Color</Label>
                  <ColorPicker 
                    color={accentColor} 
                    onChange={setAccentColor}
                  />
                </div>
                
                <div>
                  <Label className="mb-1 block text-xs">Font Family</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter" className="text-xs">Inter</SelectItem>
                      <SelectItem value="roboto" className="text-xs">Roboto</SelectItem>
                      <SelectItem value="montserrat" className="text-xs">Montserrat</SelectItem>
                      <SelectItem value="opensans" className="text-xs">Open Sans</SelectItem>
                      <SelectItem value="lato" className="text-xs">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-1 block text-xs">Font Size</Label>
                  <div className="pt-2 sm:pt-4">
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
                  <Label className="mb-1 block text-xs">Logo Position</Label>
                  <Select value={logoPosition} onValueChange={setLogoPosition}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left" className="text-xs">Left</SelectItem>
                      <SelectItem value="center" className="text-xs">Center</SelectItem>
                      <SelectItem value="right" className="text-xs">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                {["classic", "modern", "minimal", "professional", "creative"].map(template => (
                  <div 
                    key={template}
                    className={`border rounded-lg p-2 cursor-pointer transition-all hover:border-primary ${activeTemplate === template ? 'border-primary ring-2 ring-primary ring-opacity-20' : ''}`}
                    onClick={() => setActiveTemplate(template)}
                  >
                    <div className="aspect-[11/8] bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="capitalize text-xs text-gray-500">{template}</span>
                    </div>
                    <h3 className="capitalize font-medium text-xs">{template}</h3>
                    <p className="text-xs text-muted-foreground">
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
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="footer-text" className="text-xs">Custom Footer Message</Label>
                <Input 
                  id="footer-text" 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Enter a message to display at the bottom of invoices"
                  className="mt-1 text-xs"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-payment-qr" className="font-medium text-xs">Payment QR Code</Label>
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
                    <Label htmlFor="show-due-date" className="font-medium text-xs">Due Date Emphasis</Label>
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
                    <Label htmlFor="show-bank-details" className="font-medium text-xs">Bank Details</Label>
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
          
          <div className="mt-6 border-t pt-4 flex flex-col xs:flex-row gap-2 xs:justify-between">
            <Button variant="outline" size="sm" className="text-xs">Reset to Default</Button>
            <Button size="sm" className="text-xs">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
