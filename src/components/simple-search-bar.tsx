import { Search, X } from 'lucide-react';

interface SimpleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleSearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className = ""
}: SimpleSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-10 py-2.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      )}
    </div>
  );
}