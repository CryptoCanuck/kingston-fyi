'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { Search, MapPin, Calendar, Newspaper } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'events'>('all')

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
        const groups = (json.data ?? []) as { type: string; items: unknown[] }[]
        setResults({
          places: (groups.find((g) => g.type === 'places')?.items ?? []) as Place[],
          events: (groups.find((g) => g.type === 'events')?.items ?? []) as Event[],
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
  const totalResults = (results?.places.length ?? 0) + (results?.events.length ?? 0)

  const filteredPlaces = activeTab === 'events' ? [] : (results?.places ?? [])
  const filteredEvents = activeTab === 'places' ? [] : (results?.events ?? [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search places, events, and more..."
          aria-label="Search"
          className="input pl-12 pr-28 py-3.5 text-lg rounded-2xl shadow-md"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary py-2"
        >
          Search
        </button>
      </form>

      {/* Results header with tabs */}
      {hasResults && !loading && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <strong className="text-gray-700">{totalResults}</strong> results for &ldquo;{query}&rdquo;
          </p>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(['all', 'places', 'events'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-24 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No query */}
      {!query && !loading && (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--city-surface)]">
            <Search className="h-10 w-10 text-[var(--city-primary)] opacity-50" />
          </div>
          <p className="mt-6 text-gray-500">
            Enter a search term to find places and events.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && noResults && query && (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
            <Search className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">No results found</h2>
          <p className="mt-2 text-gray-500">
            No places or events match &ldquo;{query}&rdquo;. Try a different search term.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-8">
          {filteredPlaces.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <MapPin className="h-5 w-5 text-[var(--city-primary)]" />
                Places ({results!.places.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </section>
          )}

          {filteredEvents.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-[var(--city-primary)]" />
                Events ({results!.events.length})
              </h2>
              <div className="space-y-3">
                {filteredEvents.map((event) => (
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
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
