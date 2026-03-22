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
import { createServerSupabaseClient } from '@/lib/supabase/server'
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
  const supabase = await createServerSupabaseClient(city)

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

  const dateObj = new Date(event.start_date + 'T00:00:00')
  const dateFormatted = {
    month: dateObj.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase(),
    day: dateObj.getDate(),
    weekday: dateObj.toLocaleDateString('en-CA', { weekday: 'long' }),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[var(--city-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <article>
        {/* Hero Header */}
        <div className="card overflow-hidden mb-8">
          <div className="relative city-gradient text-white p-8 sm:p-10">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="relative flex items-start gap-6">
              {/* Large date badge */}
              <div className="hidden sm:flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="text-xs font-bold tracking-widest">{dateFormatted.month}</span>
                <span className="text-3xl font-extrabold leading-tight">{dateFormatted.day}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.is_free ? (
                    <span className="badge badge-success">Free</span>
                  ) : event.ticket_price ? (
                    <span className="badge bg-white/20 text-white">{event.ticket_price}</span>
                  ) : null}
                  {event.tags.map((tag) => (
                    <span key={tag} className="badge bg-white/15 text-white/90">{tag}</span>
                  ))}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {event.title}
                </h1>
                <p className="mt-2 text-white/70 text-sm">
                  {dateFormatted.weekday}, {formatDate(event.start_date)}
                  {startTime && ` at ${startTime}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {/* Date & Time */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
                <Calendar className="h-5 w-5 text-[var(--city-primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="font-bold text-gray-900">{formatDate(event.start_date)}</p>
                {event.end_date && event.end_date !== event.start_date && (
                  <p className="text-sm text-gray-500">to {formatDate(event.end_date)}</p>
                )}
                {(startTime || endTime) && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {startTime}{endTime && ` — ${endTime}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          {(event.venue_name || event.venue_address) && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
                  <MapPin className="h-5 w-5 text-[var(--city-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  {event.venue_name && <p className="font-bold text-gray-900">{event.venue_name}</p>}
                  {event.venue_address && (
                    <a
                      href={buildGoogleMapsUrl(fullAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--city-primary)] hover:underline"
                    >
                      {event.venue_address}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this event</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>
        )}

        {/* Tickets */}
        {(event.ticket_url || event.ticket_price) && (
          <div className="card p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
              <Ticket className="h-5 w-5 text-[var(--city-primary)]" />
              Tickets
            </h2>
            {event.ticket_price && (
              <p className="mb-4 text-gray-600">
                Price: <span className="font-bold text-gray-900">{event.ticket_price}</span>
              </p>
            )}
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Get Tickets
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Organizer */}
        {(event.organizer_name || event.organizer_email || event.organizer_phone) && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Organizer</h2>
            <div className="space-y-3">
              {event.organizer_name && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                  <span className="font-medium text-gray-700">{event.organizer_name}</span>
                </div>
              )}
              {event.organizer_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                  <a href={`tel:${event.organizer_phone}`} className="text-gray-700 hover:text-[var(--city-primary)]">
                    {event.organizer_phone}
                  </a>
                </div>
              )}
              {event.organizer_email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--city-primary)]" />
                  <a href={`mailto:${event.organizer_email}`} className="text-gray-700 hover:text-[var(--city-primary)]">
                    {event.organizer_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
