import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { cache } from 'react'
import React from 'react'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { buildMetadata } from '@/lib/seo/metadata'
import { buildEventJsonLd } from '@/lib/seo/event'
import { JsonLd } from '@/lib/seo'
import { hasRichTextContent } from '@/lib/directory/quality'
import { resolveEventPlace } from '@/lib/events/location'
import { formatEventWhen } from '@/lib/events/format'
import { Ph, Stars, CatTag, Icon } from '@/components/ui'
import { DirectoryMap } from '@/components/directory/DirectoryMap'
import { ShareButton } from '@/components/business/ShareButton'

type RelObj = { id?: string; slug?: string | null; name?: string | null }
const rel = (v: unknown): (RelObj & Record<string, unknown>) | null =>
  v && typeof v === 'object' ? (v as RelObj & Record<string, unknown>) : null

const loadEvent = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) return null
  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [{ city: { equals: city.id } }, { slug: { equals: slug } }, { status: { in: PUBLIC_STATUSES } }],
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  const event = docs[0]
  if (!event) return null
  return { city, event: event as unknown as Record<string, unknown> }
})

const priceLabel = (event: Record<string, unknown>): string =>
  event.isFree ? 'Free' : (event.priceText as string | null)?.trim() || 'Paid'

const imageOf = (event: Record<string, unknown>): { url?: string | null; alt?: string | null } | null => {
  const img = event.image
  return img && typeof img === 'object' ? (img as { url?: string | null; alt?: string | null }) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadEvent(slug)
  if (!loaded) return buildMetadata({ title: 'Event not found', noindex: true })
  const { event } = loaded
  const img = imageOf(event)
  return buildMetadata({
    title: String(event.title ?? 'Event'),
    description: (event.blurb as string | null) ?? undefined,
    path: `/events/${slug}`,
    openGraph: img?.url ? { images: [img.url] } : undefined,
  })
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const loaded = await loadEvent(slug)
  if (!loaded) notFound()
  const { city, event } = loaded

  const title = String(event.title ?? 'Event')
  const blurb = (event.blurb as string | null) ?? null
  const img = imageOf(event)
  const category = rel(event.category)
  const neighbourhood = rel(event.neighbourhood)
  const venue = rel(event.venue)
  const when = formatEventWhen(event.startsAt as string, event as { displayDate?: string | null; displayTime?: string | null })
  const place = resolveEventPlace(event as never)
  const hasCoords = place.latitude !== undefined && place.longitude !== undefined

  const jsonLd = buildEventJsonLd({
    title,
    path: `/events/${slug}`,
    startsAt: event.startsAt as string,
    endsAt: (event.endsAt as string | null) ?? undefined,
    blurb,
    venue: event.venue as never,
    locationName: event.locationName as string | null,
    address: event.address as never,
    location: event.location as [number, number] | null,
  })

  const venuePhoto = (() => {
    const photos = venue?.photos
    const first = Array.isArray(photos) ? photos[0] : null
    return first && typeof first === 'object' ? (first as { url?: string | null }) : null
  })()
  const venueHood = rel(venue?.neighbourhood)?.name ?? neighbourhood?.name ?? null

  return (
    <div className="kf-route">
      <JsonLd data={jsonLd} />

      {/* hero */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 'clamp(240px,34vw,420px)' }}>
          {img?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.url}
              alt={img.alt ?? title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Ph hue="ph-b" height="100%" icon="calendar" />
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(16,24,30,.78), rgba(16,24,30,.05))',
          }}
        />
        <div className="kf-wrap" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 28px 26px' }}>
          <Link
            href="/events"
            style={{
              background: 'rgba(255,255,255,.16)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 14,
              padding: '7px 13px',
              borderRadius: 'var(--r-sm)',
              marginBottom: 16,
              backdropFilter: 'blur(4px)',
            }}
          >
            <Icon name="chevL" size={16} /> All events
          </Link>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {category?.name && <CatTag label={category.name} color="var(--accent)" />}
            <span className="tag" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--ink)' }}>
              {priceLabel(event)}
            </span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(30px,4.4vw,52px)', maxWidth: 900 }}>{title}</h1>
        </div>
      </div>

      <div className="kf-wrap" style={{ padding: '32px 28px 56px' }}>
        <div
          className="kf-detail-layout"
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 44, alignItems: 'start' }}
        >
          {/* main */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>About this event</h2>
            {hasRichTextContent(event.description) ? (
              <div className="kf-prose">
                <RichText data={event.description as never} />
              </div>
            ) : blurb ? (
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink)' }}>{blurb}</p>
            ) : (
              <p className="meta" style={{ fontSize: 16 }}>Details for {title} are coming soon.</p>
            )}

            <h2 style={{ fontSize: 22, margin: '34px 0 12px' }}>Location</h2>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', height: 280 }}>
                {hasCoords ? (
                  <DirectoryMap
                    pins={[
                      {
                        id: venue?.id ?? String(event.id),
                        slug: venue?.slug ?? slug,
                        name: place.name,
                        lng: place.longitude!,
                        lat: place.latitude!,
                      },
                    ]}
                    hrefBase={venue ? '/business' : '/events'}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--limestone)',
                      color: 'var(--ink-faint)',
                    }}
                  >
                    <Icon name="pin" size={26} stroke={1.4} />
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{place.name}</div>
                  {venueHood && (
                    <div className="meta" style={{ marginTop: 3 }}>
                      <Icon name="pin" size={14} /> {venueHood}, {city.name ?? 'Kingston'}
                    </div>
                  )}
                </div>
                {hasCoords && (
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="external" size={15} /> Directions
                  </a>
                )}
              </div>
            </div>

            {/* Related-news rail (FR38) arrives with News (Epic 4/6); empty until then. */}
          </div>

          {/* sidebar */}
          <aside
            className="kf-detail-side"
            style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            <div className="card" style={{ padding: '22px 22px 24px' }}>
              <DetailRow icon="calendar" label="Date" value={when.dateLine} />
              <DetailRow icon="clock" label="Time" value={when.time} />
              {venue?.name && <DetailRow icon="pin" label="Venue" value={venue.name} sub={venueHood ?? undefined} />}
              {!venue && place.name && <DetailRow icon="pin" label="Location" value={place.name} />}
              <DetailRow icon="ticket" label="Price" value={priceLabel(event)} last />
              <a
                className="btn btn-primary btn-lg"
                href={`/events/${slug}/ics`}
                download={`${slug}.ics`}
                style={{ width: '100%', marginTop: 18 }}
              >
                <Icon name="calendar" size={18} /> Add to Calendar
              </a>
              <div style={{ marginTop: 9 }}>
                <ShareButton title={title} />
              </div>
            </div>

            {/* Cross-link to the venue's directory page (FR38) */}
            {venue?.slug && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--limestone)',
                    borderBottom: '1px solid var(--line)',
                    fontWeight: 800,
                    fontSize: 12.5,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-soft)',
                  }}
                >
                  The venue
                </div>
                <Link
                  href={`/business/${venue.slug}`}
                  className="kf-cross"
                  style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, color: 'var(--ink)' }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 'var(--r-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    {venuePhoto?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venuePhoto.url}
                        alt={venue.name ?? 'Venue'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Ph hue="ph-a" height="100%" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{venue.name}</div>
                    {rel(venue.category)?.name && (
                      <div className="meta" style={{ fontSize: 13, marginTop: 2 }}>
                        {rel(venue.category)?.name}
                      </div>
                    )}
                    {typeof venue.rating === 'number' && (
                      <div style={{ marginTop: 5 }}>
                        <Stars value={venue.rating as number} count={(venue.reviewCount as number) ?? undefined} />
                      </div>
                    )}
                  </div>
                  <Icon name="chevR" size={18} style={{ color: 'var(--ink-faint)' }} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  sub,
  last,
}: {
  icon: 'calendar' | 'clock' | 'pin' | 'ticket'
  label: string
  value: string
  sub?: string
  last?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 13, padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <Icon name={icon} size={19} style={{ color: 'var(--accent-strong)', marginTop: 2 }} />
      <div>
        <div className="faint" style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, marginTop: 2 }}>{value}</div>
        {sub && <div className="meta" style={{ fontSize: 13 }}>{sub}</div>}
      </div>
    </div>
  )
}
