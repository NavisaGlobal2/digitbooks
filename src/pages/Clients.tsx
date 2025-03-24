
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import ClientsHeader from "@/components/clients/ClientsHeader";
import ClientsOverview from "@/components/clients/ClientsOverview";
import ClientsTable from "@/components/clients/ClientsTable";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ClientsHeader />
        
        <main className="flex-1 overflow-auto px-6 py-6">
          <div className="space-y-6">
            {/* Client Statistics Overview */}
            <ClientsOverview />
            
            {/* Search and Filter */}
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search clients"
                  className="w-full px-4 py-2 pl-10 border border-border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-border rounded-md flex items-center gap-2">
                  <span>Sort</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <button className="px-4 py-2 border border-border rounded-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Clients Table */}
            <ClientsTable searchQuery={searchQuery} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Clients;
