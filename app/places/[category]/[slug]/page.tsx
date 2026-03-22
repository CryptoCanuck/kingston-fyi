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

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: typedPlace.name,
    description: typedPlace.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: typedPlace.street_address,
      addressLocality: typedPlace.city || config.name,
      addressRegion: typedPlace.province,
      postalCode: typedPlace.postal_code,
      addressCountry: 'CA',
    },
    ...(typedPlace.phone && { telephone: typedPlace.phone }),
    ...(typedPlace.website && { url: typedPlace.website }),
    ...(typedPlace.rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: typedPlace.rating,
        reviewCount: typedPlace.review_count,
        bestRating: 5,
      },
    }),
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-gray-400">
        <Link href="/places" className="hover:text-[var(--city-primary)] transition-colors">Places</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/places/${categorySlug}`} className="hover:text-[var(--city-primary)] transition-colors">{categoryName}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-700 font-medium">{typedPlace.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="card overflow-hidden mb-8">
        <div className="relative h-48 sm:h-64 city-gradient flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative text-center text-white px-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-md">
              {typedPlace.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <span className="badge bg-white/20 text-white backdrop-blur-sm">{categoryName}</span>
              {typedPlace.is_verified && <span className="badge badge-success">Verified</span>}
              {typedPlace.claim_status !== 'claimed' && (
                <Link href={`/claim/${typedPlace.id}`} className="badge bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                  Claim This Business
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-700">{formatRating(typedPlace.rating)}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({typedPlace.review_count} {typedPlace.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          {typedPlace.price_range && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{typedPlace.price_range}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {typedPlace.description && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{typedPlace.description}</p>
            </div>
          )}

          {/* Features & Amenities */}
          {(typedPlace.features.length > 0 || typedPlace.amenities.length > 0) && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Features & Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {[...typedPlace.features, ...typedPlace.amenities].map((item) => (
                  <span key={item} className="badge bg-[var(--city-surface)] text-[var(--city-primary)]">{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Hours */}
          {typedPlace.hours && Object.keys(typedPlace.hours).length > 0 && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                <Clock className="h-5 w-5 text-[var(--city-primary)]" />
                Hours
              </h2>
              {renderHours(typedPlace.hours)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contact info card */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Contact & Location</h2>

            {address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                <div>
                  <p className="text-gray-700">{address}</p>
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[var(--city-primary)] hover:underline text-xs">
                      View on Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {typedPlace.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                <a href={`tel:${typedPlace.phone}`} className="text-gray-700 hover:text-[var(--city-primary)]">{typedPlace.phone}</a>
              </div>
            )}

            {typedPlace.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                <a href={`mailto:${typedPlace.email}`} className="text-gray-700 hover:text-[var(--city-primary)]">{typedPlace.email}</a>
              </div>
            )}

            {typedPlace.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                <a href={typedPlace.website} target="_blank" rel="noopener noreferrer"
                  className="text-[var(--city-primary)] hover:underline truncate">
                  {typedPlace.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="card overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-[var(--city-surface)] to-gray-100 flex items-center justify-center">
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-gray-400 hover:text-[var(--city-primary)] transition-colors">
                  <MapPin className="h-8 w-8" />
                  <span className="text-sm font-medium">Open in Google Maps</span>
                </a>
              ) : (
                <MapPin className="h-8 w-8 text-gray-300" />
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Reviews section */}
      <section className="mt-12">
        <h2 className="section-title mb-6">Reviews</h2>
        <div className="space-y-6">
          <div className="card p-6">
            <ReviewForm placeId={typedPlace.id} cityId={city} />
          </div>
          <ReviewList placeId={typedPlace.id} cityId={city} />
        </div>
      </section>
    </div>
  )
}
