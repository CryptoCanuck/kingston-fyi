import { getPayload, type Payload } from 'payload'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import config from '@/payload.config'
import { Events } from '@/collections/Events'
import { DEFAULT_CITY_SLUG } from '@/lib/city'
import { buildEventJsonLd } from '@/lib/seo/event'
import { eventBucket } from '@/lib/events/buckets'

type AnyField = {
  name?: string
  type?: string
  fields?: AnyField[]
  defaultValue?: unknown
  required?: boolean
  relationTo?: string
  hasMany?: boolean
}
const namedFields = (fields: AnyField[]): Record<string, AnyField> => {
  const out: Record<string, AnyField> = {}
  for (const f of fields) {
    if (f.name) out[f.name] = f
    if (Array.isArray(f.fields)) Object.assign(out, namedFields(f.fields))
  }
  return out
}

describe('Events collection (Story 3.1)', () => {
  const fields = namedFields(Events.fields as AnyField[])

  it('has the full event data model (FR13)', () => {
    expect(Events.slug).toBe('events')
    for (const name of [
      'title',
      'slug',
      'blurb',
      'startsAt',
      'endsAt',
      'displayDate',
      'displayTime',
      'category',
      'neighbourhood',
      'isFree',
      'priceText',
      'image',
      'venue',
      'locationName',
      'address',
      'location',
      'provenance',
      'status',
      'city',
    ]) {
      expect(fields[name], `missing field: ${name}`).toBeTruthy()
    }
  })

  it('requires a title and a machine start datetime', () => {
    expect(fields.title.required).toBe(true)
    expect(fields.startsAt.required).toBe(true)
  })

  it('never auto-publishes — defaults to draft (NFR4)', () => {
    expect(fields.status.defaultValue).toBe('draft')
  })

  it('links a nullable venue to a business (FR38)', () => {
    expect(fields.venue.type).toBe('relationship')
    expect(fields.venue.relationTo).toBe('businesses')
    expect(fields.venue.hasMany).toBe(false)
    expect(fields.venue.required).toBeFalsy()
  })

  it('carries its own geospatial point for the location fallback (FR62)', () => {
    expect(fields.location.type).toBe('point')
  })

  it('wires the cross-link invariant, geocode/re-moderate, and revalidation hooks', () => {
    expect(Events.hooks?.beforeValidate?.length).toBeGreaterThan(0)
    expect(Events.hooks?.beforeChange?.length).toBeGreaterThanOrEqual(2)
    expect(Events.hooks?.afterChange?.length).toBeGreaterThan(0)
    expect(Events.hooks?.afterDelete?.length).toBeGreaterThan(0)
  })
})

describe('Events collection — live data pipeline (Story 3.1/3.2)', () => {
  let payload: Payload
  let cityId: string
  let createdId: string | null = null

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      overrideAccess: true,
    })
    cityId = String(docs[0]?.id)
  })

  afterAll(async () => {
    if (createdId) await payload.delete({ collection: 'events', id: createdId, overrideAccess: true })
  })

  it('accepts a full event (own location), reads it back, and emits located JSON-LD', async () => {
    // Explicit coordinates so the geocode hook is a no-op (no network in tests).
    const startsAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    const created = await payload.create({
      collection: 'events',
      overrideAccess: true,
      data: {
        title: 'Test Lighthouse Concert',
        slug: 'test-lighthouse-concert',
        startsAt,
        isFree: true,
        locationName: 'Springer Market Square',
        location: [-76.482, 44.229] as [number, number],
        provenance: { source: 'operator' },
        status: 'published',
        city: cityId,
      },
    })
    createdId = String(created.id)

    const reloaded = await payload.findByID({ collection: 'events', id: createdId, overrideAccess: true })
    expect((reloaded.location as number[])?.length).toBe(2)
    expect(eventBucket(reloaded.startsAt as string)).toBe('today')

    const jsonLd = buildEventJsonLd({
      title: reloaded.title as string,
      path: `/events/${reloaded.slug}`,
      startsAt: reloaded.startsAt as string,
      locationName: reloaded.locationName as string,
      location: reloaded.location as [number, number],
    }) as Record<string, unknown>
    expect(jsonLd['@type']).toBe('Event')
    expect((jsonLd.location as Record<string, unknown>).geo).toMatchObject({ latitude: 44.229, longitude: -76.482 })
  })
})
