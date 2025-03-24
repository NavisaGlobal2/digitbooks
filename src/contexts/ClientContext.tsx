
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, ClientStatus } from '@/types/client';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'status' | 'invoiceCount' | 'totalAmount'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);

  // Load clients from localStorage on mount
  useEffect(() => {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      try {
        const parsedClients = JSON.parse(storedClients);
        setClients(parsedClients);
      } catch (error) {
        console.error("Failed to parse stored clients:", error);
      }
    } else {
      // Seed with sample data if no clients exist
      const sampleClients: Client[] = [
        {
          id: "1",
          name: "Chukwuemeka LTD",
          email: "techsolutions@gmail.com",
          phone: "+234 812 345 6789",
          address: "123 Tech Avenue, Lagos",
          company: "Chukwuemeka LTD",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 10,
          totalAmount: 100000
        },
        {
          id: "2",
          name: "Stark Technologies",
          email: "techsolutions@gmail.com",
          phone: "+234 809 876 5432",
          address: "456 Innovation Drive, Abuja",
          company: "Stark Technologies",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 15,
          totalAmount: 150000
        },
        {
          id: "3",
          name: "Globex Industries",
          email: "techsolutions@gmail.com",
          phone: "+234 703 123 4567",
          address: "789 Export Zone, Port Harcourt",
          company: "Globex Industries",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 20,
          totalAmount: 200000
        },
        {
          id: "4",
          name: "Figma Subscription",
          email: "techsolutions@gmail.com",
          phone: "+234 815 987 6543",
          address: "321 Design Street, Lagos",
          company: "Figma Subscription",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 40,
          totalAmount: 300000
        },
        {
          id: "5",
          name: "App Subscription",
          email: "techsolutions@gmail.com",
          phone: "+234 908 765 4321",
          address: "654 Mobile Road, Kano",
          company: "App Subscription",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 50,
          totalAmount: 400000
        },
        {
          id: "6",
          name: "Tech Solutions",
          email: "techsolutions@gmail.com",
          phone: "+234 701 234 5678",
          address: "987 IT Park, Enugu",
          company: "Tech Solutions",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 24,
          totalAmount: 180000
        },
        {
          id: "7",
          name: "Amarachhhii LTD",
          email: "techsolutions@gmail.com",
          phone: "+234 803 456 7890",
          address: "246 Business Avenue, Lagos",
          company: "Amarachhhii LTD",
          status: "active",
          createdAt: new Date().toISOString(),
          invoiceCount: 40,
          totalAmount: 320000
        }
      ];
      
      setClients(sampleClients);
      localStorage.setItem('clients', JSON.stringify(sampleClients));
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'status' | 'invoiceCount' | 'totalAmount'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active' as ClientStatus,
      invoiceCount: 0,
      totalAmount: 0
    };
    
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => 
      prev.map(client => 
        client.id === id 
          ? { ...client, ...clientData } 
          : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  return (
    <ClientContext.Provider value={{ 
      clients, 
      addClient, 
      updateClient,
      deleteClient,
      getClientById
    }}>
      {children}
    </ClientContext.Provider>
  );
};
