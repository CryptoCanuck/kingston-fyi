'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Place, Event } from '@/types/models';
import debounce from 'lodash/debounce';

interface SearchResults {
  places: Place[];
  events: Event[];
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ places: [], events: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ places: [], events: [] });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const performSearch = useCallback(debouncedSearch, [debouncedSearch]);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ places: [], events: [] });
  };

  const hasResults = results.places.length > 0 || results.events.length > 0;

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search places, events, restaurants..."
          className="w-full px-12 py-3 text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="spinner mx-auto mb-2"></div>
              Searching...
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Places Results */}
              {results.places.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Places
                  </h3>
                  <div className="space-y-2">
                    {results.places.map((place) => (
                      <Link
                        key={place.id}
                        href={`/places/${place.category}/${place.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {place.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {place.subcategories.join(', ')} • {place.address.street}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Results */}
              {results.events.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Events
                  </h3>
                  <div className="space-y-2">
                    {results.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()} • {event.location.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Results */}
              <div className="p-2 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-2"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}