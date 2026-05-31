import { getPayload } from 'payload'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { buildIcsEvent } from '@/lib/events/ics'
import { resolveEventPlace } from '@/lib/events/location'
import { canonicalUrl } from '@/lib/seo/metadata'

/**
 * Serves the "Add to Calendar" .ics file for a published event (FR17). The detail page links
 * here with a download attribute, so the browser saves an importable calendar file.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) return new Response('Not found', { status: 404 })

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [{ city: { equals: city.id } }, { slug: { equals: slug } }, { status: { in: PUBLIC_STATUSES } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const event = docs[0] as unknown as Record<string, unknown> | undefined
  if (!event) return new Response('Not found', { status: 404 })

  const place = resolveEventPlace(event as never)
  const ics = buildIcsEvent({
    uid: String(event.id),
    title: String(event.title ?? 'Event'),
    startsAt: String(event.startsAt),
    endsAt: (event.endsAt as string | null) ?? undefined,
    description: (event.blurb as string | null) ?? undefined,
    locationName: place.name,
    url: canonicalUrl(`/events/${slug}`),
  })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  })
}
