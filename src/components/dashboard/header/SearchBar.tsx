
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SearchBarProps {
  isExpanded: boolean;
  toggleExpand: () => void;
}

const SearchBar = ({ isExpanded, toggleExpand }: SearchBarProps) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const searchInput = target.elements.namedItem('search') as HTMLInputElement;
    
    if (searchInput && searchInput.value) {
      toast.success(`Searching for: ${searchInput.value}`);
      searchInput.value = '';
      toggleExpand();
    }
  };

  return (
    <>
      {isExpanded ? (
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[160px] sm:max-w-[260px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text"
            name="search"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
            autoFocus
            onBlur={(e) => {
              // Only collapse if no value and clicked outside
              if (!e.currentTarget.value) {
                setTimeout(() => toggleExpand(), 200);
              }
            }}
          />
        </form>
      ) : (
        <button 
          className="flex items-center justify-center rounded-full w-8 h-8 text-secondary hover:bg-accent/10"
          onClick={toggleExpand}
          aria-label="Search"
        >
          <Search className="h-4 sm:h-5 w-4 sm:w-5" />
        </button>
      )}
    </>
  );
};

export default SearchBar;
