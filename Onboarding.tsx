import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    title: "Welcome to DigiBooks",
    description: "Let's get your business set up in just a few steps"
  },
  {
    title: "Business Information",
    description: "Tell us about your business"
  },
  {
    title: "Legal Information",
    description: "Add your business registration details"
  },
  {
    title: "Choose Features",
    description: "Select the features you need"
  },
  {
    title: "Connect Bank Account",
    description: "Link your business bank account"
  }
];

const BUSINESS_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "limited_liability", label: "Limited Liability Company" },
  { value: "corporation", label: "Corporation" }
];

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail & Commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "other", label: "Other" }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    type: "",
    industry: "",
    size: "",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    phone: "",
    website: ""
  });

  const [legalInfo, setLegalInfo] = useState({
    rcNumber: "", // Required
    taxId: "", // Optional
    vatNumber: "", // Optional
    registrationDate: "" // Optional
  });

  const [selectedFeatures, setSelectedFeatures] = useState({
    invoicing: true,
    expenses: true,
    banking: false,
    reports: false,
    budgeting: false,
    inventory: false
  });

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!businessInfo.name || !businessInfo.type || !businessInfo.industry) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    if (currentStep === 2) {
      // Only RC Number is required
      if (!legalInfo.rcNumber) {
        toast.error("Please provide your RC Number");
        return;
      }
    }

    // If this is the final step
    if (currentStep === steps.length - 1) {
      try {
        // Save business profile to Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            business_name: businessInfo.name,
            industry: businessInfo.industry,
            tax_number: legalInfo.taxId || null, // Optional
            rc_number: legalInfo.rcNumber, // Required
            business_type: businessInfo.type,
            registration_date: legalInfo.registrationDate || null, // Optional
            vat_number: legalInfo.vatNumber || null, // Optional
            phone: businessInfo.phone,
            website: businessInfo.website,
            address: businessInfo.address
          });

        if (error) throw error;

        toast.success("Setup completed! Welcome to DigiBooks");
        navigate("/dashboard");
      } catch (error) {
        console.error('Error saving profile:', error);
        toast.error("Failed to save business profile");
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to DigiBooks</h1>
            <p className="text-muted-foreground mb-8">
              Let's get your business set up in just a few steps
            </p>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNext}
            >
              Get Started
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business name *</Label>
              <Input
                id="business-name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business type *</Label>
              <Select 
                value={businessInfo.type}
                onValueChange={(value) => setBusinessInfo({ ...businessInfo, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select 
                value={businessInfo.industry}
                onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Business phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="Enter business phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Business website</Label>
                <Input
                  id="website"
                  type="url"
                  value={businessInfo.website}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business address</Label>
              <Input
                id="address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                placeholder="Enter business address"
              />
            </div>

            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rc-number">RC Number *</Label>
              <Input
                id="rc-number"
                value={legalInfo.rcNumber}
                onChange={(e) => setLegalInfo({ ...legalInfo, rcNumber: e.target.value })}
                placeholder="Enter RC Number"
                required
              />
              <p className="text-sm text-muted-foreground">
                Your Corporate Affairs Commission (CAC) registration number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax Identification Number (TIN)</Label>
              <Input
                id="tax-id"
                value={legalInfo.taxId}
                onChange={(e) => setLegalInfo({ ...legalInfo, taxId: e.target.value })}
                placeholder="Enter TIN (Optional)"
              />
              <p className="text-sm text-muted-foreground">
                Your Federal Inland Revenue Service (FIRS) tax identification number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat-number">VAT Registration Number</Label>
              <Input
                id="vat-number"
                value={legalInfo.vatNumber}
                onChange={(e) => setLegalInfo({ ...legalInfo, vatNumber: e.target.value })}
                placeholder="Enter VAT number (Optional)"
              />
              <p className="text-sm text-muted-foreground">
                Your Value Added Tax registration number if applicable
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration-date">Business Registration Date</Label>
              <Input
                id="registration-date"
                type="date"
                value={legalInfo.registrationDate}
                onChange={(e) => setLegalInfo({ ...legalInfo, registrationDate: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                The date your business was registered with CAC
              </p>
            </div>

            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedFeatures).map(([feature, enabled]) => (
                <Card 
                  key={feature}
                  className={`p-4 cursor-pointer transition-colors ${
                    enabled ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedFeatures(prev => ({
                    ...prev,
                    [feature]: !prev[feature]
                  }))}
                >
                  <h3 className="font-medium capitalize">{feature}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getFeatureDescription(feature)}
                  </p>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Connect your bank account</h3>
              <p className="text-muted-foreground mb-6">
                Link your business bank account to automatically import transactions
              </p>
            </div>

            <div className="grid gap-4">
              <Button variant="outline" className="h-20 text-left justify-start">
                <div>
                  <div className="font-medium">Access Bank</div>
                  <div className="text-sm text-muted-foreground">Connect with Mono</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 text-left justify-start">
                <div>
                  <div className="font-medium">Zenith Bank</div>
                  <div className="text-sm text-muted-foreground">Connect with Mono</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 text-left justify-start">
                <div>
                  <div className="font-medium">GTBank</div>
                  <div className="text-sm text-muted-foreground">Connect with Mono</div>
                </div>
              </Button>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Skip for now
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={handleNext}
              >
                Connect Bank
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`h-2 flex-1 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-1">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
};

// Helper function to get feature descriptions
const getFeatureDescription = (feature: string): string => {
  const descriptions: Record<string, string> = {
    invoicing: "Create and manage professional invoices",
    expenses: "Track and categorize business expenses",
    banking: "Connect and sync bank transactions",
    reports: "Generate detailed financial reports",
    budgeting: "Create and manage business budgets",
    inventory: "Track inventory and stock levels"
  };
  return descriptions[feature] || "";
};

export default Onboarding;