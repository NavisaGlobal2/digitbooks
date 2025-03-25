
import React from "react";

export const OnboardingLeftColumn: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col justify-center items-center p-8 bg-white h-screen w-full relative">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-10">
          <div className="text-3xl font-bold">
            <span className="text-[#05D166]">Digit</span>
            <span className="text-gray-800">Books</span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-lg font-medium text-gray-800 mb-2">Your AI-Powered Financial Assistant</div>
        </div>
        
        <div className="relative w-full mb-10">
          <img 
            src="/lovable-uploads/3c97809b-fb08-4f4c-9722-c7e298d6cf6f.png" 
            alt="World Map" 
            className="w-full opacity-10" 
          />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/lovable-uploads/cda6dcfb-f89c-4ba5-bcce-512da2a1d734.png" 
              alt="Financial Chart" 
              className="w-56" 
            />
          </div>
        </div>
        
        <div className="text-center mt-6">
          <h2 className="text-lg font-medium mb-2">Say goodbye to manual bookkeeping.</h2>
          <p className="text-gray-600 text-sm">
            Digitbooks AI makes expense tracking, invoicing, and reporting effortless.
          </p>
        </div>
      </div>
    </div>
  );
};
