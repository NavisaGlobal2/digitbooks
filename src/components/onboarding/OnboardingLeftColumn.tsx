
import React from "react";

export const OnboardingLeftColumn: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col justify-center items-center p-8 bg-white h-screen w-full md:w-1/2 relative">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-10">
          <div className="text-3xl font-bold">
            <span className="text-[#05D166]">Digi</span>
            <span className="text-gray-800">Books</span>
          </div>
        </div>
        
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Simplify Your Financial Management</h1>
          <p className="text-lg text-gray-600">
            DigiBooks helps you track expenses, manage invoices, and generate reports in minutes, not hours.
          </p>
        </div>
        
        <div className="relative w-full mb-12 flex justify-center">
          <div className="relative animate-float">
            <img 
              src="/lovable-uploads/cda6dcfb-f89c-4ba5-bcce-512da2a1d734.png" 
              alt="Financial Chart" 
              className="w-80 h-auto" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white opacity-30"></div>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-600 text-lg">
            Join thousands of businesses already saving time with DigiBooks.
          </p>
        </div>
      </div>
    </div>
  );
};
