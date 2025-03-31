
import React from "react";
import { Database } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DatabaseSelectorProps {
  selectedDatabase: string;
  onDatabaseChange: (database: string) => void;
}

export const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  selectedDatabase,
  onDatabaseChange
}) => {
  const databases = [
    { value: "primary", label: "Primary Database" },
    { value: "reporting", label: "Reporting Database" },
    { value: "archive", label: "Archive Database" }
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Database className="h-4 w-4" />
        <span>Database:</span>
      </div>
      <Select value={selectedDatabase} onValueChange={onDatabaseChange}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Select database" />
        </SelectTrigger>
        <SelectContent>
          {databases.map(db => (
            <SelectItem key={db.value} value={db.value}>
              {db.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
