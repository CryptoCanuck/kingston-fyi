import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

import { DEFAULT_CITY_SLUG } from '@/lib/city'

let payload: Payload
let kingstonId: string

const countIn = async (collection: string): Promise<number> => {
  const { totalDocs } = await payload.count({
    collection: collection as never,
    where: { city: { equals: kingstonId } },
    overrideAccess: true,
  })
  return totalDocs
}

describe('Shared taxonomies (Story 1.4)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      overrideAccess: true,
    })
    kingstonId = String(docs[0]?.id)
  })

  it('seeds 8 neighbourhoods in Kingston', async () => {
    expect(await countIn('neighbourhoods')).toBeGreaterThanOrEqual(8)
  })

  it('seeds 6 news categories, each with a tag colour', async () => {
    const { docs } = await payload.find({
      collection: 'news-categories',
      where: { city: { equals: kingstonId } },
      limit: 100,
      overrideAccess: true,
    })
    expect(docs.length).toBeGreaterThanOrEqual(6)
    expect(docs.every((d) => /^#[0-9a-f]{6}$/i.test(String((d as { color?: string }).color)))).toBe(true)
    expect(docs.map((d) => d.slug)).toContain('arts-and-culture')
  })

  it('seeds 5 event categories', async () => {
    expect(await countIn('event-categories')).toBeGreaterThanOrEqual(5)
  })

  it('seeds a two-level business category hierarchy (parent → leaf)', async () => {
    const leaf = await payload.find({
      collection: 'business-categories',
      where: { and: [{ slug: { equals: 'coffee-shop' } }, { city: { equals: kingstonId } }] },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const doc = leaf.docs[0] as { parent?: { name?: string } | string | null } | undefined
    expect(doc).toBeDefined()
    const parent = doc?.parent
    const parentName = parent && typeof parent === 'object' ? parent.name : undefined
    expect(parentName).toBe('Food & Drink')
  })

  it('every seeded taxonomy term is scoped to Kingston (no city leakage)', async () => {
    for (const c of ['neighbourhoods', 'news-categories', 'event-categories', 'business-categories']) {
      const { docs } = await payload.find({
        collection: c as never,
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      const cityIds = docs.map((d) => {
        const city = (d as { city?: unknown }).city
        return typeof city === 'object' && city ? String((city as { id: unknown }).id) : String(city)
      })
      expect(cityIds.every((id) => id === kingstonId)).toBe(true)
    }
  })
})
