import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
