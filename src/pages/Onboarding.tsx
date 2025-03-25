
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUSINESS_TYPES, INDUSTRIES } from "@/components/onboarding/OnboardingConstants";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    type: "",
    industry: "",
    size: "1-5",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    phone: "",
    website: ""
  });

  const [legalInfo, setLegalInfo] = useState({
    rcNumber: "",
    taxId: "",
    vatNumber: "",
    registrationDate: ""
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
    if (currentStep === 0 && !businessInfo.name) {
      toast.error("Please enter your business name");
      return;
    }

    if (currentStep === 1) {
      if (!businessInfo.industry) {
        toast.error("Please select your industry");
        return;
      }
    }

    if (currentStep === 2) {
      if (!legalInfo.rcNumber) {
        toast.error("Please provide your RC Number");
        return;
      }
    }

    // If this is the final step
    if (currentStep === 3) {
      try {
        // Save business profile to Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            business_name: businessInfo.name,
            industry: businessInfo.industry,
            tax_number: legalInfo.taxId || null,
            rc_number: legalInfo.rcNumber,
            business_type: businessInfo.type,
            registration_date: legalInfo.registrationDate || null,
            vat_number: legalInfo.vatNumber || null,
            phone: businessInfo.phone,
            website: businessInfo.website,
            address: businessInfo.address,
            business_size: businessInfo.size
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

  const renderLeftColumn = () => {
    return (
      <div className="hidden md:flex flex-col justify-center items-center p-8 bg-white h-screen w-full">
        <div className="mb-6">
          <div className="flex items-center mb-8">
            <div className="text-4xl font-bold">
              <span className="text-[#05D166]">Digit</span>
              <span className="text-gray-800">Books</span>
            </div>
          </div>
          
          <div className="bg-white px-8 py-4 rounded-lg shadow-sm mb-8 mx-auto">
            <div className="text-center">Your AI-Powered Financial Assistant</div>
          </div>
        </div>
        
        <div className="relative w-full max-w-md mx-auto">
          <img src="/lovable-uploads/3c97809b-fb08-4f4c-9722-c7e298d6cf6f.png" alt="World Map" className="w-full opacity-25" />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src="/lovable-uploads/a24925e2-43db-4889-a722-45a1c1440051.png" alt="Financial Chart" className="w-64" />
          </div>
        </div>
        
        <div className="mt-12 max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Say goodbye to manual bookkeeping.</h2>
          <p className="text-gray-600">
            Digitbooks AI makes expense tracking, invoicing, and reporting effortless.
          </p>
        </div>
      </div>
    );
  };

  const renderWelcomeStep = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Hello, I am Digitbooks</h1>
          <p className="text-white/80 mb-6">
            I handle your bookkeeping, track expenses, manage invoices, and generate financial reports—so you can focus on growing your business.
          </p>
          <p className="text-white/90">
            I'd love to get to know your business so I can help you better.
          </p>
        </div>
        
        <div>
          <label htmlFor="business-name" className="block text-white mb-2">
            Business name
          </label>
          <Input
            id="business-name"
            value={businessInfo.name}
            onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
            placeholder="Enter your business name"
            className="bg-white text-black"
          />
        </div>

        <Button 
          className="w-full bg-black hover:bg-black/90 text-white py-6"
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    );
  };

  const renderBusinessInfoStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Great! I need more information about your business</h2>
        </div>
        
        <div>
          <label htmlFor="industry" className="block text-white mb-2">
            Business industry
          </label>
          <Select 
            value={businessInfo.industry}
            onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}
          >
            <SelectTrigger className="bg-white text-black">
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

        <div>
          <label htmlFor="location" className="block text-white mb-2">
            Business location
          </label>
          <Select 
            value={businessInfo.state}
            onValueChange={(value) => setBusinessInfo({ ...businessInfo, state: value })}
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Ikorodu Lagos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
              <SelectItem value="kano">Kano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full bg-black hover:bg-black/90 text-white py-6"
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    );
  };

  const renderLegalInfoStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="rc-number" className="block text-white mb-2">
            Business registration number
          </label>
          <Input
            id="rc-number"
            value={legalInfo.rcNumber}
            onChange={(e) => setLegalInfo({ ...legalInfo, rcNumber: e.target.value })}
            placeholder="RC123456"
            className="bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-white mb-2">
            Business size
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 bg-white rounded-md px-4 py-2">
              <input
                type="radio"
                checked={businessInfo.size === "1-5"}
                onChange={() => setBusinessInfo({ ...businessInfo, size: "1-5" })}
                className="text-[#05D166]"
              />
              <span className="text-black">1-5 staffs</span>
            </label>
            
            <label className="flex items-center space-x-2 bg-white rounded-md px-4 py-2">
              <input
                type="radio"
                checked={businessInfo.size === "6-20"}
                onChange={() => setBusinessInfo({ ...businessInfo, size: "6-20" })}
                className="text-[#05D166]"
              />
              <span className="text-black">6-20 staffs</span>
            </label>
            
            <label className="flex items-center space-x-2 bg-white rounded-md px-4 py-2">
              <input
                type="radio"
                checked={businessInfo.size === "20+"}
                onChange={() => setBusinessInfo({ ...businessInfo, size: "20+" })}
                className="text-[#05D166]"
              />
              <span className="text-black">Above 20 staffs</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-white mb-2">
            Preferred currency
          </label>
          <Select 
            value="NGN"
            onValueChange={() => {}}
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Naira" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">Naira</SelectItem>
              <SelectItem value="USD">US Dollar</SelectItem>
              <SelectItem value="EUR">Euro</SelectItem>
              <SelectItem value="GBP">British Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full bg-black hover:bg-black/90 text-white py-6"
          onClick={handleNext}
        >
          Let's begin
        </Button>
      </div>
    );
  };

  const renderFinalStep = () => {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to start your financial journey!</h2>
        <p className="text-white/80 mb-8">
          Your business profile has been set up. Now let's start managing your finances more efficiently.
        </p>
        
        <Button 
          className="w-full bg-black hover:bg-black/90 text-white py-6"
          onClick={handleNext}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  };

  const renderRightColumn = () => {
    return (
      <div className="p-8 md:p-12 w-full h-full flex flex-col justify-center">
        {currentStep === 0 && renderWelcomeStep()}
        {currentStep === 1 && renderBusinessInfoStep()}
        {currentStep === 2 && renderLegalInfoStep()}
        {currentStep === 3 && renderFinalStep()}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {renderLeftColumn()}
      <div className="w-full md:w-1/2 bg-[#05D166] flex flex-col justify-center">
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default Onboarding;
