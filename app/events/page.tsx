import type { Metadata } from 'next'
import { Calendar } from 'lucide-react'
import { getCityFromHeaders, CITY_CONFIG } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/event-card'
import type { Event } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]

  return {
    title: `Events in ${config.name}`,
    description: `Discover upcoming events in ${config.name}. Concerts, festivals, community gatherings, and more.`,
  }
}

export default async function EventsPage() {
  const city = await getCityFromHeaders()
  const config = CITY_CONFIG[city]

  const supabase = await createServerSupabaseClient(city)
  const today = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('city_id', city)
    .eq('is_active', true)
    .eq('status', 'published')
    .gte('start_date', today)
    .order('start_date', { ascending: true })
    .limit(50)

  const typedEvents = (events ?? []) as Event[]

  // Group events by date
  const grouped = new Map<string, Event[]>()
  for (const event of typedEvents) {
    const dateKey = event.start_date
    const list = grouped.get(dateKey) ?? []
    list.push(event)
    grouped.set(dateKey, list)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
            <Calendar className="h-5 w-5 text-[var(--city-primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Events in {config.name}
            </h1>
            <p className="text-gray-500">Discover what&apos;s happening in your city</p>
          </div>
        </div>
      </div>

      {typedEvents.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Calendar className="h-8 w-8 text-gray-300" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">No upcoming events</h2>
          <p className="mt-2 text-sm text-gray-500">
            Check back soon for new events in {config.name}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([dateKey, dateEvents]) => (
            <section key={dateKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  {formatDate(dateKey)}
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-3">
                {dateEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
