import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Ticket,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Event } from '@/lib/types'

function formatTime(time: string | null): string | null {
  if (!time) return null
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

function buildGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

async function getEvent(slug: string, city: string): Promise<Event | null> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('city_id', city)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'published')
    .single()

  return data as Event | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]
  const event = await getEvent(slug, city)

  if (!event) {
    return { title: 'Event Not Found' }
  }

  return {
    title: `${event.title} — ${formatDate(event.start_date)}`,
    description: event.description
      ? event.description.slice(0, 160)
      : `${event.title} on ${formatDate(event.start_date)} in ${config.name}`,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const city = await getCityFromHeaders()
  const event = await getEvent(slug, city)

  if (!event) {
    notFound()
  }

  const startTime = formatTime(event.start_time)
  const endTime = formatTime(event.end_time)
  const fullAddress = [event.venue_name, event.venue_address].filter(Boolean).join(', ')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-city-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <article>
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {event.is_free ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Free
              </span>
            ) : event.ticket_price ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {event.ticket_price}
              </span>
            ) : null}
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-city-primary/10 px-3 py-1 text-xs font-medium text-city-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {event.title}
          </h1>
        </header>

        {/* Date, Time, Location info */}
        <div className="mb-8 space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-city-primary" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(event.start_date)}</p>
              {event.end_date && event.end_date !== event.start_date && (
                <p className="text-sm text-gray-500">
                  to {formatDate(event.end_date)}
                </p>
              )}
            </div>
          </div>

          {(startTime || endTime) && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-city-primary" />
              <p className="font-medium text-gray-900">
                {startTime}
                {endTime && ` — ${endTime}`}
              </p>
            </div>
          )}

          {(event.venue_name || event.venue_address) && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-city-primary" />
              <div>
                {event.venue_name && (
                  <p className="font-medium text-gray-900">{event.venue_name}</p>
                )}
                {event.venue_address && (
                  <a
                    href={buildGoogleMapsUrl(fullAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-city-primary hover:underline"
                  >
                    {event.venue_address}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">About this event</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-line text-gray-600">
              {event.description}
            </div>
          </div>
        )}

        {/* Tickets */}
        {(event.ticket_url || event.ticket_price) && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Ticket className="h-5 w-5 text-city-primary" />
              Tickets
            </h2>
            {event.ticket_price && (
              <p className="mb-3 text-gray-600">
                Price: <span className="font-medium text-gray-900">{event.ticket_price}</span>
              </p>
            )}
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-city-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Get Tickets
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Organizer */}
        {(event.organizer_name || event.organizer_email || event.organizer_phone) && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Organizer</h2>
            <div className="space-y-2">
              {event.organizer_name && (
                <p className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  {event.organizer_name}
                </p>
              )}
              {event.organizer_phone && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`tel:${event.organizer_phone}`} className="hover:text-city-primary">
                    {event.organizer_phone}
                  </a>
                </p>
              )}
              {event.organizer_email && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`mailto:${event.organizer_email}`} className="hover:text-city-primary">
                    {event.organizer_email}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
