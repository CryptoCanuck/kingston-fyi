'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Place, Event } from '@/types/models';

interface SearchResults {
  places: Place[];
  events: Event[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults>({ places: [], events: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, fetchResults]);

  const totalResults = results.places.length + results.events.length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <h1 className="heading-2 mb-2">
            Search Results
          </h1>
          <p className="text-muted">
            {isLoading ? (
              'Searching...'
            ) : (
              <>Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner h-8 w-8"></div>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted mb-4">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-muted">
              Try searching with different keywords or browse our categories
            </p>
            <Link
              href="/explore"
              className="btn-primary mt-6"
            >
              Explore Categories
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Places Results */}
            {results.places.length > 0 && (
              <section>
                <h2 className="heading-3 mb-6">
                  Places ({results.places.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.places.map((place) => (
                    <Link
                      key={place.id}
                      href={`/places/${place.category}/${place.slug}`}
                      className="card card-hover p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {place.name}
                          </h3>
                          <p className="text-sm text-muted mb-2">
                            {place.subcategories.join(', ')}
                          </p>
                          <p className="text-sm text-muted">
                            {place.address.street}
                          </p>
                          {place.rating && (
                            <div className="flex items-center mt-2 text-sm">
                              <span className="text-yellow-500">★</span>
                              <span className="ml-1 font-medium">
                                {place.rating.toFixed(1)}
                              </span>
                              <span className="text-muted ml-1">
                                ({place.reviewCount} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Events Results */}
            {results.events.length > 0 && (
              <section>
                <h2 className="heading-3 mb-6">
                  Events ({results.events.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="card card-hover p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {event.title}
                          </h3>
                          <p className="text-sm text-muted mb-2">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted">
                            {event.startTime} • {event.location.name}
                          </p>
                          {event.ticketInfo && (
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2">
                              ${event.ticketInfo.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <h1 className="heading-2 mb-2">
            Search Results
          </h1>
          <p className="text-muted">Loading...</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="spinner h-8 w-8"></div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
