import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, expect } from 'vitest'

import config from '@/payload.config'
import { Businesses } from '@/collections/Businesses'
import { andAccess } from '@/access/combine'
import { pointField } from '@/fields/pointField'
import {
  buildBusinessJsonLd,
  localBusinessSubtype,
  LOCAL_BUSINESS_SUBTYPES,
} from '@/lib/seo/business'

// Recursively collect named fields (descends into row/group/collapsible wrappers).
type AnyField = { name?: string; type?: string; fields?: AnyField[]; defaultValue?: unknown }
const namedFields = (fields: AnyField[]): Record<string, AnyField> => {
  const out: Record<string, AnyField> = {}
  for (const f of fields) {
    if (f.name) out[f.name] = f
    if (Array.isArray(f.fields)) Object.assign(out, namedFields(f.fields))
  }
  return out
}

describe('Businesses collection (Story 2.1)', () => {
  const fields = namedFields(Businesses.fields as AnyField[])

  it('is the directory centerpiece with the right slug + admin group', () => {
    expect(Businesses.slug).toBe('businesses')
    expect(Businesses.admin?.group).toBe('Directory')
  })

  it('carries the full listing data model (FR20)', () => {
    for (const name of [
      'name',
      'slug',
      'blurb',
      'description',
      'category',
      'neighbourhood',
      'priceTier',
      'hours',
      'address',
      'phone',
      'website',
      'amenities',
      'photos',
      'rating',
      'reviewCount',
      'location',
      'provenance',
      'status',
      'city',
    ]) {
      expect(fields[name], `missing field: ${name}`).toBeTruthy()
    }
  })

  it('stores coordinates as a PostGIS point field (FR24)', () => {
    expect(fields.location.type).toBe('point')
  })

  it('never auto-publishes — status defaults to draft (NFR4)', () => {
    expect(fields.status.defaultValue).toBe('draft')
  })

  it('gates writes behind staff access and reads behind moderation + city scope', () => {
    expect(typeof Businesses.access?.read).toBe('function')
    expect(typeof Businesses.access?.create).toBe('function')
    expect(typeof Businesses.access?.update).toBe('function')
  })

  it('wires moderation + revalidation + cross-link hooks', () => {
    expect(Businesses.hooks?.beforeValidate?.length).toBeGreaterThan(0)
    expect(Businesses.hooks?.beforeChange?.length).toBeGreaterThan(0)
    expect(Businesses.hooks?.afterChange?.length).toBeGreaterThan(0)
    expect(Businesses.hooks?.afterDelete?.length).toBeGreaterThan(0)
  })
})

describe('andAccess() combinator', () => {
  const allow = () => true
  const deny = () => false
  const cityWhere = () => ({ city: { equals: 'c1' } })
  const statusWhere = () => ({ status: { in: ['approved', 'published'] } })
  const args = { req: {} } as never

  it('denies if any function denies', async () => {
    expect(await andAccess(allow, deny)(args)).toBe(false)
  })

  it('returns true when all grant full access', async () => {
    expect(await andAccess(allow, allow)(args)).toBe(true)
  })

  it('passes through a single Where constraint untouched', async () => {
    expect(await andAccess(allow, cityWhere)(args)).toEqual({ city: { equals: 'c1' } })
  })

  it('AND-combines multiple Where constraints', async () => {
    expect(await andAccess(cityWhere, statusWhere)(args)).toEqual({
      and: [{ city: { equals: 'c1' } }, { status: { in: ['approved', 'published'] } }],
    })
  })
})

describe('pointField()', () => {
  it('produces a Payload point field', () => {
    const f = pointField()
    expect(f.type).toBe('point')
    expect(f.name).toBe('location')
  })
})

describe('LocalBusiness JSON-LD (FR28, NFR1)', () => {
  it('maps leaf categories to the most-specific subtype', () => {
    expect(localBusinessSubtype('coffee-shop')).toBe('CafeOrCoffeeShop')
    expect(localBusinessSubtype('restaurant')).toBe('Restaurant')
    expect(localBusinessSubtype('bookstore')).toBe('BookStore')
    expect(LOCAL_BUSINESS_SUBTYPES.bakery).toBe('Bakery')
  })

  it('falls back to the parent category, then to generic LocalBusiness', () => {
    expect(localBusinessSubtype('studio', 'recreation')).toBe('SportsActivityLocation')
    expect(localBusinessSubtype('unknown-leaf', 'unknown-parent')).toBe('LocalBusiness')
    expect(localBusinessSubtype()).toBe('LocalBusiness')
  })

  it('emits the subtype, geo from [lng,lat], and website as sameAs', () => {
    const node = buildBusinessJsonLd({
      name: 'Test Cafe',
      path: '/business/test-cafe',
      blurb: 'Cozy spot',
      website: 'https://testcafe.example',
      location: [-76.48, 44.23],
      categoryLeafSlug: 'coffee-shop',
    })
    expect(node['@type']).toBe('CafeOrCoffeeShop')
    expect(node.description).toBe('Cozy spot')
    expect(node.sameAs).toBe('https://testcafe.example')
    expect(node.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 44.23, longitude: -76.48 })
  })

  it('NEVER emits aggregateRating — even if rating-ish data is passed through', () => {
    const node = buildBusinessJsonLd({
      name: 'Rated Place',
      path: '/business/rated-place',
      categoryLeafSlug: 'restaurant',
      // Smuggled-in rating data must never surface in structured output (NFR1 guardrail).
      rating: 4.7,
      reviewCount: 230,
      aggregateRating: { ratingValue: 4.7 },
    } as never)
    expect(node.aggregateRating).toBeUndefined()
    expect(node.review).toBeUndefined()
    expect(JSON.stringify(node)).not.toContain('aggregateRating')
  })
})

// DB-backed verification of the migration's geospatial AC (FR24): the geometry column is
// constrained to SRID 4326 and a GiST index backs it.
describe('Businesses geospatial schema (migration)', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('has a geometry(Point,4326) location column registered with PostGIS', async () => {
    const { sql } = await import('drizzle-orm')
    const res = (await payload.db.drizzle.execute(sql`
      SELECT type, srid FROM geometry_columns
      WHERE f_table_name = 'businesses' AND f_geometry_column = 'location'
    `)) as { rows?: Array<{ type: string; srid: number }> }
    const rows = res.rows ?? (res as unknown as Array<{ type: string; srid: number }>)
    expect(rows.length).toBe(1)
    expect(String(rows[0].type).toUpperCase()).toContain('POINT')
    expect(Number(rows[0].srid)).toBe(4326)
  })

  it('has a GiST index on the location column', async () => {
    const { sql } = await import('drizzle-orm')
    const res = (await payload.db.drizzle.execute(sql`
      SELECT indexdef FROM pg_indexes WHERE tablename = 'businesses'
    `)) as { rows?: Array<{ indexdef: string }> }
    const rows = res.rows ?? (res as unknown as Array<{ indexdef: string }>)
    const gistDefs = rows.map((r) => String(r.indexdef).toLowerCase()).filter((d) => d.includes('using gist'))
    expect(gistDefs.some((d) => d.includes('location'))).toBe(true)
  })
})
