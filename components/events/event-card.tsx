import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  className?: string
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-CA', { weekday: 'short' }),
  }
}

function formatTime(time: string | null): string | null {
  if (!time) return null
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function EventCard({ event, className }: EventCardProps) {
  const date = formatEventDate(event.start_date)
  const time = formatTime(event.start_time)

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn('card group flex gap-4 p-5', className)}
    >
      {/* Date badge */}
      <div className="flex h-18 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--city-surface)] text-[var(--city-primary)]">
        <span className="text-[10px] font-bold tracking-wider">{date.month}</span>
        <span className="text-2xl font-extrabold leading-tight">{date.day}</span>
        <span className="text-[10px] font-medium text-gray-400">{date.weekday}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-gray-900 group-hover:text-[var(--city-primary)] transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          {event.venue_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="line-clamp-1">{event.venue_name}</span>
            </span>
          )}
          {time && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {time}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {event.is_free ? (
            <span className="badge badge-success">Free</span>
          ) : event.ticket_price ? (
            <span className="badge bg-gray-100 text-gray-600">{event.ticket_price}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
