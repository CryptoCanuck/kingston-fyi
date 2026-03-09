import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  className?: string
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
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
      className={cn(
        'group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-city-primary/10 text-city-primary">
        <span className="text-[10px] font-bold leading-none">{date.month}</span>
        <span className="text-2xl font-bold leading-tight">{date.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-city-primary transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          {event.venue_name && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{event.venue_name}</span>
            </span>
          )}
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {time}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          {event.is_free ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Free
            </span>
          ) : event.ticket_price ? (
            <span className="text-xs text-gray-500">{event.ticket_price}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
