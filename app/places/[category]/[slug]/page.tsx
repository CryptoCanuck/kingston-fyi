import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Star,
  DollarSign,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatRating } from '@/lib/utils'
import type { Place, Category } from '@/lib/types'
import ReviewList from '@/components/reviews/review-list'
import ReviewForm from '@/components/reviews/review-form'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const supabase = await createServerSupabaseClient(city)

  const { data: place } = await supabase
    .from('places')
    .select('name, description')
    .eq('city_id', city)
    .eq('category_id', categorySlug)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!place) return { title: 'Place Not Found' }

  return {
    title: `${place.name} — ${config.name}`,
    description:
      place.description?.slice(0, 160) ||
      `${place.name} in ${config.name}. View details, hours, and more.`,
  }
}

function formatAddress(place: Place): string {
  return [place.street_address, place.city, place.province, place.postal_code]
    .filter(Boolean)
    .join(', ')
}

function renderHours(hours: Record<string, unknown> | null) {
  if (!hours || Object.keys(hours).length === 0) return null

  const dayOrder = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  const entries = dayOrder
    .filter((day) => day in hours)
    .map((day) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      value: hours[day] as string,
    }))

  // If no ordered entries found, fall back to whatever keys exist
  const fallback =
    entries.length === 0
      ? Object.entries(hours).map(([day, value]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          value: String(value),
        }))
      : entries

  if (fallback.length === 0) return null

  return (
    <div className="space-y-1">
      {fallback.map(({ day, value }) => (
        <div key={day} className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{day}</span>
          <span className="text-gray-500">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default async function PlaceDetailPage({ params }: Props) {
  const { category: categorySlug, slug } = await params
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const supabase = await createServerSupabaseClient(city)

  // Fetch place
  const { data: place } = await supabase
    .from('places')
    .select('*')
    .eq('city_id', city)
    .eq('category_id', categorySlug)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!place) notFound()

  const typedPlace = place as Place

  // Fetch category name
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categorySlug)
    .single()

  const categoryName = (category as Category | null)?.name || categorySlug
  const address = formatAddress(typedPlace)
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link
          href="/places"
          className="hover:text-city-primary transition-colors"
        >
          Places
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/places/${categorySlug}`}
          className="hover:text-city-primary transition-colors"
        >
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">{typedPlace.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {typedPlace.name}
          </h1>
          {typedPlace.is_verified && (
            <span className="mt-1.5 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Verified
            </span>
          )}
          {typedPlace.claim_status !== 'claimed' && (
            <Link
              href={`/claim/${typedPlace.id}`}
              className="mt-1.5 inline-flex items-center rounded-full border border-city-primary px-3 py-1 text-xs font-medium text-city-primary hover:bg-city-primary hover:text-white transition-colors"
            >
              Claim This Business
            </Link>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Link
            href={`/places/${categorySlug}`}
            className="inline-flex items-center rounded-full bg-city-primary/10 px-3 py-1 text-sm font-medium text-city-primary"
          >
            {categoryName}
          </Link>

          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">
              {formatRating(typedPlace.rating)}
            </span>
            {typedPlace.review_count > 0 && (
              <span className="text-sm text-gray-500">
                ({typedPlace.review_count}{' '}
                {typedPlace.review_count === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>

          {typedPlace.price_range && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              {typedPlace.price_range}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {typedPlace.description && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {typedPlace.description}
              </p>
            </section>
          )}

          {/* Features & Amenities */}
          {(typedPlace.features.length > 0 ||
            typedPlace.amenities.length > 0) && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Features & Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {[...typedPlace.features, ...typedPlace.amenities].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

          {/* Hours */}
          {typedPlace.hours && Object.keys(typedPlace.hours).length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Clock className="h-5 w-5" />
                Hours
              </h2>
              <div className="rounded-lg border border-gray-100 bg-white p-4">
                {renderHours(typedPlace.hours)}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contact info card */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Contact & Location</h2>

            {address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-gray-700">{address}</p>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-city-primary hover:underline"
                    >
                      View on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {typedPlace.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <a
                  href={`tel:${typedPlace.phone}`}
                  className="text-gray-700 hover:text-city-primary"
                >
                  {typedPlace.phone}
                </a>
              </div>
            )}

            {typedPlace.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <a
                  href={`mailto:${typedPlace.email}`}
                  className="text-gray-700 hover:text-city-primary"
                >
                  {typedPlace.email}
                </a>
              </div>
            )}

            {typedPlace.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                <a
                  href={typedPlace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-city-primary hover:underline truncate"
                >
                  {typedPlace.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Map placeholder */}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
                <MapPin className="h-8 w-8" />
                <span className="text-sm font-medium">
                  Open in Google Maps
                </span>
              </div>
            </a>
          )}
        </aside>
      </div>

      {/* Reviews section */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews</h2>
        <div className="space-y-8">
          <ReviewForm placeId={typedPlace.id} cityId={city} />
          <ReviewList placeId={typedPlace.id} cityId={city} />
        </div>
      </section>
    </div>
  )
}
