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
import { buildBusinessJsonLd } from '@/lib/seo/business'
import { JsonLd } from '@/lib/seo'
import { listingQuality, hasRichTextContent } from '@/lib/directory/quality'
import { summarizeReviews } from '@/lib/reviews'
import { isOpenNow, type OpeningInterval } from '@/lib/openNow'
import { Stars, DotSep, Icon, ContactRow, TagOutline } from '@/components/ui'
import { DirectoryMap } from '@/components/directory/DirectoryMap'
import { Section } from '@/components/business/Section'
import { BusinessGallery, type GalleryPhoto } from '@/components/business/BusinessGallery'
import { BusinessHours } from '@/components/business/BusinessHours'
import { BusinessReviews, type ReviewItem } from '@/components/business/BusinessReviews'
import { VenueEventsRail, type VenueEvent } from '@/components/business/VenueEventsRail'
import { ShareButton } from '@/components/business/ShareButton'

type RelObj = { slug?: string | null; name?: string | null; parent?: unknown }
const rel = (v: unknown): RelObj | null => (v && typeof v === 'object' ? (v as RelObj) : null)

// React.cache dedupes the fetch between generateMetadata and the page render in one request.
const loadBusiness = cache(async (slug: string) => {
  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) return null
  const { docs } = await payload.find({
    collection: 'businesses',
    where: {
      and: [
        { city: { equals: city.id } },
        { slug: { equals: slug } },
        { status: { in: PUBLIC_STATUSES } },
      ],
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  const business = docs[0]
  if (!business) return null
  return { payload, city, business: business as unknown as Record<string, unknown> }
})

const photosOf = (business: Record<string, unknown>): GalleryPhoto[] => {
  const photos = business.photos
  if (!Array.isArray(photos)) return []
  return photos
    .map((p) => (p && typeof p === 'object' ? (p as GalleryPhoto) : null))
    .filter((p): p is GalleryPhoto => !!p)
}

const addressLine = (business: Record<string, unknown>): string => {
  const a = (business.address ?? {}) as Record<string, string | null | undefined>
  return [a.street, a.locality].filter(Boolean).join(', ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadBusiness(slug)
  if (!loaded) return buildMetadata({ title: 'Business not found', noindex: true })
  const { business } = loaded
  const name = String(business.name ?? 'Business')
  const blurb = (business.blurb as string | null) ?? undefined
  const photos = photosOf(business)
  const quality = listingQuality({
    blurb: business.blurb as string | null,
    description: business.description,
    photos,
    reviewCount: business.reviewCount as number | null,
    address: business.address as { street?: string | null } | null,
    lifecycleStatus: business.lifecycleStatus as string | null,
    provenanceSource: (business.provenance as { source?: string | null } | null)?.source,
  })

  return buildMetadata({
    title: name,
    description: blurb,
    path: `/business/${slug}`,
    noindex: !quality.indexable,
    openGraph: photos[0]?.url ? { images: [photos[0].url] } : undefined,
  })
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const loaded = await loadBusiness(slug)
  if (!loaded) notFound()
  const { payload, city, business } = loaded

  const name = String(business.name ?? 'Business')
  const blurb = (business.blurb as string | null) ?? null
  const photos = photosOf(business)
  const category = rel(business.category)
  const neighbourhood = rel(business.neighbourhood)
  const parentCat = rel(category?.parent)
  const hours = (business.hours as OpeningInterval[] | null) ?? null
  const open = isOpenNow(hours)
  const amenities = (Array.isArray(business.amenities) ? business.amenities : []) as string[]
  const website = (business.website as string | null) ?? null
  const phone = (business.phone as string | null) ?? null
  const location = business.location as [number, number] | null
  const priceTier = (business.priceTier as string | null) ?? null

  // Sourced reviews drive the histogram + list (FR61); the business carries a denormalized
  // rating but the distribution needs the records themselves.
  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: {
      and: [{ business: { equals: business.id } }, { status: { in: PUBLIC_STATUSES } }],
    },
    sort: '-reviewDate',
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })
  const allReviews = reviewsRes.docs as unknown as ReviewItem[]
  const summary = summarizeReviews(allReviews)
  const displayReviews = allReviews.slice(0, 8)

  // Upcoming events hosted at this venue (FR38). Future, published, city-scoped, soonest first.
  const venueEventsRes = await payload.find({
    collection: 'events',
    where: {
      and: [
        { venue: { equals: business.id } },
        { status: { in: PUBLIC_STATUSES } },
        { startsAt: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    sort: 'startsAt',
    depth: 0,
    limit: 6,
    overrideAccess: true,
  })
  const venueEvents: VenueEvent[] = (venueEventsRes.docs as unknown as {
    id: string
    slug?: string | null
    title: string
    startsAt?: string | null
    blurb?: string | null
  }[]).map((e) => ({ id: e.id, slug: e.slug, title: e.title, startsAt: e.startsAt, summary: e.blurb }))

  const metaBits = [category?.name, priceTier, neighbourhood?.name].filter(Boolean) as string[]

  const jsonLd = buildBusinessJsonLd({
    name,
    path: `/business/${slug}`,
    blurb,
    telephone: phone,
    website,
    address: {
      streetAddress: (business.address as Record<string, string>)?.street,
      addressLocality: (business.address as Record<string, string>)?.locality,
      addressRegion: (business.address as Record<string, string>)?.region,
      postalCode: (business.address as Record<string, string>)?.postalCode,
    },
    location,
    imageUrls: photos.map((p) => p.url).filter((u): u is string => !!u),
    categoryLeafSlug: category?.slug,
    categoryParentSlug: parentCat?.slug,
  })

  const hoursLabel = open === null ? null : open ? 'Open now' : 'Closed'

  return (
    <div className="kf-route">
      <JsonLd data={jsonLd} />

      {/* gallery */}
      <div className="kf-wrap" style={{ padding: '20px 28px 0' }}>
        <Link
          href="/directory"
          style={{
            color: 'var(--ink-soft)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          <Icon name="chevL" size={16} /> Back to Directory
        </Link>
        <BusinessGallery photos={photos} name={name} />
      </div>

      <div className="kf-wrap" style={{ padding: '26px 28px 56px' }}>
        {/* header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 18,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 40 }}>{name}</h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              {hoursLabel && (
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--r-pill)',
                    background: open ? 'var(--accent-soft)' : 'var(--limestone-2)',
                    color: open ? 'var(--accent-strong)' : 'var(--ink-soft)',
                  }}
                >
                  {hoursLabel}
                </span>
              )}
              {summary.average !== null && (
                <Stars value={summary.average} count={summary.count} />
              )}
              {metaBits.length > 0 && (
                <span className="meta">
                  {metaBits.map((bit, i) => (
                    <React.Fragment key={bit}>
                      {i > 0 && <DotSep />}
                      {bit}
                    </React.Fragment>
                  ))}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <ShareButton title={name} />
            {website && (
              <a
                className="btn btn-primary"
                href={website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="globe" size={16} /> Visit website
              </a>
            )}
          </div>
        </div>

        {amenities.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 4px' }}>
            {amenities.map((t) => (
              <TagOutline key={t}>{t}</TagOutline>
            ))}
          </div>
        )}

        <div
          className="kf-detail-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 44,
            alignItems: 'start',
            marginTop: 24,
          }}
        >
          {/* main column */}
          <div>
            <Section title="About">
              {hasRichTextContent(business.description) ? (
                <div className="kf-prose">
                  <RichText data={business.description as never} />
                </div>
              ) : blurb ? (
                <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ink)' }}>{blurb}</p>
              ) : (
                <p className="meta" style={{ fontSize: 16 }}>
                  More about {name} is coming soon.
                </p>
              )}
            </Section>

            <VenueEventsRail events={venueEvents} />

            <Section title={`Reviews${summary.count ? ` (${summary.count})` : ''}`}>
              <BusinessReviews summary={summary} reviews={displayReviews} />
            </Section>
          </div>

          {/* sticky sidebar */}
          <aside
            className="kf-detail-side"
            style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', height: 200 }}>
                {location ? (
                  <DirectoryMap
                    pins={[{ id: String(business.id), slug, name, lng: location[0], lat: location[1] }]}
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
                    <Icon name="map" size={26} stroke={1.4} />
                  </div>
                )}
              </div>
              <div style={{ padding: '18px 20px' }}>
                {addressLine(business) && (
                  <ContactRow icon="pin">
                    {addressLine(business)}
                    <span className="meta" style={{ display: 'block', fontSize: 13 }}>
                      {neighbourhood?.name ? `${neighbourhood.name}, ` : ''}
                      {city.name ?? 'Kingston'} ON
                    </span>
                  </ContactRow>
                )}
                {phone && (
                  <ContactRow icon="phone" href={`tel:${phone}`}>
                    {phone}
                  </ContactRow>
                )}
                {website && (
                  <ContactRow icon="globe" href={website} external>
                    {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </ContactRow>
                )}
                <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
                  {location && (
                    <a
                      className="btn btn-dark btn-sm"
                      style={{ flex: 1 }}
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location[1]},${location[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="external" size={15} /> Directions
                    </a>
                  )}
                  {phone && (
                    <a className="btn btn-ghost btn-sm" style={{ flex: 1 }} href={`tel:${phone}`}>
                      <Icon name="phone" size={15} /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>

            <BusinessHours hours={hours} />
          </aside>
        </div>
      </div>
    </div>
  )
}
