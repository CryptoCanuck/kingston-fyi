import Link from 'next/link'
import { ArrowRight, MapPin, Calendar, Utensils, ShoppingBag, Dumbbell, Palette } from 'lucide-react'
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
    description: `Discover the best places, events, and things to do in ${config.name}. ${config.tagline}`,
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
  ])

  const places = (featuredPlaces ?? []) as Place[]
  const events = (upcomingEvents ?? []) as Event[]
  const cats = (categories ?? []) as Category[]

  return (
    <>
      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${config.colors.gradient} text-white`}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover {config.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            {config.tagline} — Find the best places, events, and things to do in your city.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <SearchInput
              placeholder={`Search ${config.name} places & events...`}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {cats.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <Link
              href="/places"
              className="flex items-center gap-1 text-sm font-medium text-city-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cats.map((cat) => (
              <Link
                key={cat.id}
                href={`/places/${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md hover:border-city-primary/30 hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-city-primary/10 text-city-primary">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Places Section */}
      {places.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Featured Places</h2>
              <Link
                href="/places"
                className="flex items-center gap-1 text-sm font-medium text-city-primary hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm font-medium text-city-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-city-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Know a great spot in {config.name}?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Help your community by submitting a place or event to our directory.
          </p>
          <Link
            href="/submit"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-city-primary transition-transform hover:scale-105"
          >
            Submit a Listing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
