
import React, { useState } from 'react';
import { Check, ChevronDown, User } from "lucide-react";
import { useClients } from '@/contexts/ClientContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClientSelectorProps {
  selectedClientName: string;
  onClientSelect: (clientName: string) => void;
}

const ClientSelector = ({ selectedClientName, onClientSelect }: ClientSelectorProps) => {
  const { clients } = useClients();
  const [isCustomClient, setIsCustomClient] = useState(!clients.some(client => client.name === selectedClientName) && selectedClientName !== '');
  const [customClientName, setCustomClientName] = useState(isCustomClient ? selectedClientName : '');

  const handleClientSelect = (value: string) => {
    if (value === "custom") {
      setIsCustomClient(true);
    } else {
      setIsCustomClient(false);
      onClientSelect(value);
    }
  };

  const handleCustomClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomClientName(e.target.value);
    onClientSelect(e.target.value);
  };

  const handleAddCustomClient = () => {
    setIsCustomClient(true);
  };

  return (
    <div className="space-y-3">
      {!isCustomClient ? (
        <>
          <Select onValueChange={handleClientSelect} value={selectedClientName || undefined}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.name}>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {client.name}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <div className="flex items-center text-blue-600">
                  + Add a custom client
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
              + Add custom client
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
