
import React from "react";

export const OnboardingLeftColumn: React.FC = () => {
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
