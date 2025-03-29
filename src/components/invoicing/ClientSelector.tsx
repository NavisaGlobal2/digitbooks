
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useClients } from "@/contexts/ClientContext";

interface ClientSelectorProps {
  selectedClientName: string;
  onClientSelect: (name: string, email?: string, address?: string) => void;
}

const ClientSelector = ({ selectedClientName, onClientSelect }: ClientSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { clients } = useClients();

  useEffect(() => {
    if (selectedClientName) {
      setValue(selectedClientName);
    }
  }, [selectedClientName]);

  // Ensure we always have a valid array to work with
  const clientList = Array.isArray(clients) ? clients : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white z-50">
        <Command className="bg-white rounded-md">
          <CommandInput placeholder="Search client..." className="h-9" />
          <CommandEmpty>No client found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {clientList.map((client) => (
              <CommandItem
                key={client.id}
                value={client.name}
                onSelect={(currentValue) => {
                  const selectedClient = clientList.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                  setValue(currentValue);
                  if (selectedClient) {
                    onClientSelect(
                      currentValue, 
                      selectedClient.email,
                      selectedClient.address
                    );
                  } else {
                    onClientSelect(currentValue);
                  }
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === client.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {client.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ClientSelector;
