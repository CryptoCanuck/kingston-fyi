import Link from 'next/link'
import { ArrowRight, MapPin, Calendar, Utensils, ShoppingBag, Dumbbell, Palette, Newspaper, TrendingUp, Star } from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SearchInput } from '@/components/ui/search-input'
import { PlaceCard } from '@/components/places/place-card'
import { EventCard } from '@/components/events/event-card'
import type { Metadata } from 'next'
import type { Place, Event, Category } from '@/lib/types'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  restaurants: <Utensils className="h-6 w-6" />,
  shopping: <ShoppingBag className="h-6 w-6" />,
  fitness: <Dumbbell className="h-6 w-6" />,
  arts: <Palette className="h-6 w-6" />,
}

function getCategoryIcon(name: string) {
  const key = name.toLowerCase()
  for (const [match, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(match)) return icon
  }
  return <MapPin className="h-6 w-6" />
}

export async function generateMetadata() {
  const cityId = await getCityFromHeaders()
  const config = CITY_CONFIG[cityId]
  return {
    title: `${config.name} — Local Directory`,
    description: `Discover the best places, events, and things to do in ${config.name}. ${config.description}`,
  }
}

export default async function HomePage() {
  const cityId = await getCityFromHeaders()
  const config = CITY_CONFIG[cityId]
  const supabase = await createServerSupabaseClient(cityId)

  const [
    { data: featuredPlaces },
    { data: upcomingEvents },
    { data: categories },
    { count: totalPlaces },
    { count: totalEvents },
  ] = await Promise.all([
    supabase
      .from('places')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(6),
    supabase
      .from('events')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_active', true)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(4),
    supabase
      .from('categories')
      .select('*')
      .eq('type', 'place')
      .order('sort_order', { ascending: true })
      .limit(8),
    supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId)
      .eq('is_active', true),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId)
      .eq('is_active', true),
  ])

  const places = (featuredPlaces ?? []) as Place[]
  const events = (upcomingEvents ?? []) as Event[]
  const cats = (categories ?? []) as Category[]

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden city-gradient text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/3" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
            <MapPin className="h-4 w-4" />
            {config.tagline}
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Discover{' '}
            <span className="relative">
              {config.name}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 2 150 2 298 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
            {config.description}. Your hyperlocal guide to the best places, events, and community news.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <SearchInput
              placeholder={`Search ${config.name} places & events...`}
            />
          </div>

          {/* Quick stats */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="h-4 w-4" />
              <span><strong className="text-white font-semibold">{totalPlaces ?? 0}</strong> Places</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="h-4 w-4" />
              <span><strong className="text-white font-semibold">{totalEvents ?? 0}</strong> Events</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {cats.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Browse Categories</h2>
              <p className="section-subtitle">Find exactly what you&apos;re looking for</p>
            </div>
            <Link
              href="/places"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--city-primary)] hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/places/${cat.id}`}
                className="card group flex flex-col items-center gap-3 p-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--city-surface)] text-[var(--city-primary)] transition-colors group-hover:bg-[var(--city-primary)] group-hover:text-white">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--city-primary)] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Places Section */}
      {places.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Star className="h-6 w-6 text-amber-400" />
                  Featured Places
                </h2>
                <p className="section-subtitle">Top-rated spots hand-picked for you</p>
              </div>
              <Link
                href="/places"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--city-primary)] hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Calendar className="h-6 w-6 text-[var(--city-primary)]" />
                Upcoming Events
              </h2>
              <p className="section-subtitle">Don&apos;t miss what&apos;s happening</p>
            </div>
            <Link
              href="/events"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--city-primary)] hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden city-gradient text-white">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center relative">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Know a great spot in {config.name}?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            Help your community by submitting a place or event to our directory.
          </p>
          <Link
            href="/submit"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 font-bold text-[var(--city-primary)] shadow-lg transition-transform hover:scale-105"
          >
            Submit a Listing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
