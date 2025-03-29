
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, User, Plus } from "lucide-react";
import { useClients } from '@/contexts/ClientContext';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client } from '@/types/client';

interface ClientSelectorProps {
  selectedClientName: string;
  onClientSelect: (clientName: string, clientAddress?: string) => void;
}

const ClientSelector = ({ selectedClientName, onClientSelect }: ClientSelectorProps) => {
  const { clients } = useClients();
  const [isCustomClient, setIsCustomClient] = useState(!clients.some(client => client.name === selectedClientName) && selectedClientName !== '');
  const [customClientName, setCustomClientName] = useState(isCustomClient ? selectedClientName : '');

  // Update state when the selected client changes externally
  useEffect(() => {
    if (selectedClientName && !isCustomClient) {
      const clientExists = clients.some(client => client.name === selectedClientName);
      if (!clientExists) {
        setIsCustomClient(true);
        setCustomClientName(selectedClientName);
      }
    }
  }, [selectedClientName, clients, isCustomClient]);

  const handleClientSelect = (value: string) => {
    if (value === "custom") {
      setIsCustomClient(true);
      setCustomClientName('');
    } else {
      setIsCustomClient(false);
      
      // Find client to get their address
      const selectedClient = clients.find(client => client.name === value);
      if (selectedClient) {
        onClientSelect(value, selectedClient.address);
      } else {
        onClientSelect(value);
      }
    }
  };

  const handleCustomClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomClientName(value);
    onClientSelect(value);
  };

  const handleAddCustomClient = () => {
    setIsCustomClient(true);
    setCustomClientName('');
  };

  return (
    <div className="space-y-3">
      {!isCustomClient ? (
        <>
          <Select 
            onValueChange={handleClientSelect} 
            value={selectedClientName || undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Existing Clients</SelectLabel>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectItem value="custom">
                <div className="flex items-center text-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a custom client
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {clients.length === 0 && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2 text-sm"
              onClick={handleAddCustomClient}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add custom client
            </Button>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <Input
            value={customClientName}
            onChange={handleCustomClientChange}
            placeholder="Enter client name"
            className="w-full"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={() => setIsCustomClient(false)}
          >
            Select from existing clients
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
