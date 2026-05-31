import { describe, it, expect, afterEach } from 'vitest'

import { geocodeAddress } from '@/lib/geocoding'
import { addressToQuery } from '@/hooks/geocodeBusiness'

const feature = {
  features: [{ center: [-76.481, 44.231], geometry: { coordinates: [-76.481, 44.231] } }],
}

describe('geocodeAddress() — MapTiler (AR24)', () => {
  const original = process.env.MAPTILER_GEOCODING_KEY
  afterEach(() => {
    process.env.MAPTILER_GEOCODING_KEY = original
  })

  it('returns [lng,lat] from the first feature', async () => {
    process.env.MAPTILER_GEOCODING_KEY = 'test-key'
    let url = ''
    const fakeFetch = (async (u: string) => {
      url = u
      return { ok: true, json: async () => feature } as Response
    }) as unknown as typeof fetch
    const coords = await geocodeAddress('303 Montreal St, Kingston, ON', {
      proximity: [-76.486, 44.2312],
      fetchImpl: fakeFetch,
    })
    expect(coords).toEqual([-76.481, 44.231])
    expect(url).toContain('api.maptiler.com/geocoding')
    expect(url).toContain('key=test-key')
    expect(url).toContain('proximity=-76.486%2C44.2312')
  })

  it('returns null when no key is configured (graceful degrade)', async () => {
    process.env.MAPTILER_GEOCODING_KEY = ''
    expect(await geocodeAddress('anywhere')).toBeNull()
  })

  it('returns null (never throws) on a non-ok response or empty query', async () => {
    process.env.MAPTILER_GEOCODING_KEY = 'test-key'
    const failFetch = (async () => ({ ok: false, status: 429 }) as Response) as unknown as typeof fetch
    expect(await geocodeAddress('x', { fetchImpl: failFetch })).toBeNull()
    expect(await geocodeAddress('   ')).toBeNull()
  })
})

describe('addressToQuery()', () => {
  it('joins present address parts', () => {
    expect(
      addressToQuery({ street: '303 Montreal St', locality: 'Kingston', region: 'ON', postalCode: 'K7K 3G9', country: 'CA' }),
    ).toBe('303 Montreal St, Kingston, ON, K7K 3G9, CA')
  })
  it('returns null for an empty/sparse address', () => {
    expect(addressToQuery(null)).toBeNull()
    expect(addressToQuery({})).toBeNull()
    expect(addressToQuery({ street: '   ' })).toBeNull()
  })
})
