import { getPayload, type Payload, type Where } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

import { resolveCityByHost, normalizeHost, DEFAULT_CITY_SLUG } from '@/lib/city'
import { cityScoped } from '@/access/cityScoped'
import { crossLinkCityInvariant } from '@/hooks/crossLinkCityInvariant'

let payload: Payload
let kingstonId: string
let otherId: string

// 1x1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const ensureCity = async (name: string, slug: string, hostname: string): Promise<string> => {
  const found = await payload.find({
    collection: 'cities',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  if (found.docs[0]) return String(found.docs[0].id)
  const created = await payload.create({
    collection: 'cities',
    overrideAccess: true,
    data: { name, slug, timezone: 'America/Toronto', hostnames: [{ hostname }] },
  })
  return String(created.id)
}

const createMediaInCity = async (cityId: string, alt: string): Promise<string> => {
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt, city: cityId },
    file: { data: PNG, mimetype: 'image/png', name: `${alt}.png`, size: PNG.length },
  })
  return String(doc.id)
}

// Minimal req shape for access/baseListFilter functions.
const reqWithHost = (host: string) =>
  ({ headers: new Headers({ host }), payload }) as unknown as Parameters<
    ReturnType<typeof cityScoped>
  >[0]['req']

describe('City scoping (Story 1.2)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // onInit seeds Kingston; create a second city for isolation tests.
    kingstonId = await ensureCity('Kingston', DEFAULT_CITY_SLUG, 'kingston.fyi')
    otherId = await ensureCity('Testopia', 'testopia', 'testopia.example')
  })

  describe('hostname → city resolution', () => {
    it('normalizes hosts (lowercase, strip port)', () => {
      expect(normalizeHost('Kingston.FYI:3000')).toBe('kingston.fyi')
    })

    it('matches a known hostname to its city', async () => {
      const city = await resolveCityByHost('kingston.fyi', payload)
      expect(city?.slug).toBe('kingston')
    })

    it('routes a second city by its hostname', async () => {
      const city = await resolveCityByHost('testopia.example', payload)
      expect(city?.slug).toBe('testopia')
    })

    it('falls back to the default city for localhost / unknown hosts', async () => {
      expect((await resolveCityByHost('localhost', payload))?.slug).toBe('kingston')
      expect((await resolveCityByHost('unknown.example', payload))?.slug).toBe('kingston')
    })
  })

  describe('cityScoped() isolation (NFR7)', () => {
    it('a city-scoped query cannot return another city\'s rows', async () => {
      const kAlt = `k-${Date.now()}`
      const oAlt = `o-${Date.now()}`
      await createMediaInCity(kingstonId, kAlt)
      const otherMediaId = await createMediaInCity(otherId, oAlt)

      const access = cityScoped()
      const where = await access({ req: reqWithHost('kingston.fyi') } as never)
      expect(where).not.toBe(false)

      const result = await payload.find({
        collection: 'media',
        where: where as Where,
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })

      // Every returned row is Kingston; the other city's row is absent.
      const cityIds = result.docs.map((d) => {
        const c = (d as { city?: unknown }).city
        if (c == null) return null
        return typeof c === 'object' ? String((c as { id: unknown }).id) : String(c)
      })
      expect(cityIds.every((id) => id === kingstonId)).toBe(true)
      expect(result.docs.some((d) => String(d.id) === otherMediaId)).toBe(false)
    })
  })

  describe('crossLinkCityInvariant()', () => {
    const makeReq = (relatedCity: string) =>
      ({
        payload: { findByID: async () => ({ city: relatedCity }) },
      }) as unknown as Parameters<ReturnType<typeof crossLinkCityInvariant>>[0]['req']

    it('rejects a relationship whose endpoint is in a different city', async () => {
      const hook = crossLinkCityInvariant([{ field: 'venue', relationTo: 'cities' }])
      await expect(
        hook({
          data: { city: kingstonId, venue: 'some-id' },
          req: makeReq(otherId),
          // remaining hook args are unused by the implementation
        } as never),
      ).rejects.toThrow(/different city/i)
    })

    it('allows a relationship within the same city', async () => {
      const hook = crossLinkCityInvariant([{ field: 'venue', relationTo: 'cities' }])
      await expect(
        hook({
          data: { city: kingstonId, venue: 'some-id' },
          req: makeReq(kingstonId),
        } as never),
      ).resolves.toBeDefined()
    })
  })
})
