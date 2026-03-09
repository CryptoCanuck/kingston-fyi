'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard } from '@/components/events/event-card'
import { PlaceCard } from '@/components/places/place-card'
import type { Event, Place } from '@/lib/types'

interface SearchResults {
  places: Place[]
  events: Event[]
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') ?? ''

  const [input, setInput] = useState(query)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      if (res.ok) {
        const json = await res.json()
        setResults({
          places: json.data?.places ?? [],
          events: json.data?.events ?? [],
        })
      } else {
        setResults({ places: [], events: [] })
      }
    } catch {
      setResults({ places: [], events: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setInput(query)
    fetchResults(query)
  }, [query, fetchResults])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  const hasResults = results && (results.places.length > 0 || results.events.length > 0)
  const noResults = results && results.places.length === 0 && results.events.length === 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search places, events, and more..."
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm transition-shadow placeholder:text-gray-400 focus:border-city-primary focus:outline-none focus:ring-2 focus:ring-city-primary/20"
        />
      </form>

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-3 h-6 w-24" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="mt-3 h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="mb-3 h-6 w-24" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No query */}
      {!query && !loading && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">
            Enter a search term to find places and events.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && noResults && query && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No results found</h2>
          <p className="mt-2 text-sm text-gray-500">
            No places or events match &ldquo;{query}&rdquo;. Try a different search term.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-10">
          {results.places.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Places ({results.places.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </section>
          )}

          {results.events.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Events ({results.events.length})
              </h2>
              <div className="space-y-3">
                {results.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
