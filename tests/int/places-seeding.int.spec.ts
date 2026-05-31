import { describe, it, expect, afterEach } from 'vitest'

import { searchPlacesText, SEED_FIELD_MASK } from '@/lib/places/client'
import {
  mapPlaceToBusiness,
  lifecycleFromStatus,
  hoursFromPlace,
  categoryLeafFromPlace,
} from '@/lib/places/mapToBusiness'
import { detectDuplicates, normalizeName, haversineMeters } from '@/lib/places/dedup'
import { isStale, STALE_AFTER_DAYS } from '@/lib/places/staleness'
import { jobTasks } from '@/jobs'
import type { Place } from '@/lib/places/types'

const samplePlace: Place = {
  id: 'ChIJtest123',
  displayName: { text: 'The Elm Cafe', languageCode: 'en' },
  formattedAddress: '303 Montreal St, Kingston, ON K7K 3G9, Canada',
  location: { latitude: 44.2334, longitude: -76.4812 },
  nationalPhoneNumber: '(613) 555-0100',
  websiteUri: 'https://elmcafe.example',
  rating: 4.6,
  userRatingCount: 212,
  primaryType: 'coffee_shop',
  types: ['coffee_shop', 'cafe', 'food'],
  businessStatus: 'OPERATIONAL',
  regularOpeningHours: {
    periods: [
      { open: { day: 1, hour: 8, minute: 0 }, close: { day: 1, hour: 16, minute: 30 } },
      // Friday late close wrapping past midnight.
      { open: { day: 5, hour: 18, minute: 0 }, close: { day: 6, hour: 1, minute: 0 } },
    ],
  },
  addressComponents: [
    { longText: '303', shortText: '303', types: ['street_number'] },
    { longText: 'Montreal Street', shortText: 'Montreal St', types: ['route'] },
    { longText: 'Kingston', shortText: 'Kingston', types: ['locality'] },
    { longText: 'Ontario', shortText: 'ON', types: ['administrative_area_level_1'] },
    { longText: 'K7K 3G9', shortText: 'K7K 3G9', types: ['postal_code'] },
    { longText: 'Canada', shortText: 'CA', types: ['country'] },
  ],
}

describe('mapPlaceToBusiness() (FR29)', () => {
  it('maps a full Place into our business shape', () => {
    const m = mapPlaceToBusiness(samplePlace)!
    expect(m.placeId).toBe('ChIJtest123')
    expect(m.name).toBe('The Elm Cafe')
    expect(m.location).toEqual([-76.4812, 44.2334]) // [lng, lat]
    expect(m.phone).toBe('(613) 555-0100')
    expect(m.website).toBe('https://elmcafe.example')
    expect(m.rating).toBe(4.6)
    expect(m.reviewCount).toBe(212)
    expect(m.lifecycleStatus).toBe('active')
    expect(m.categoryLeafSlug).toBe('coffee-shop')
    expect(m.address).toEqual({
      street: '303 Montreal Street',
      locality: 'Kingston',
      region: 'ON',
      postalCode: 'K7K 3G9',
      country: 'CA',
    })
  })

  it('returns null when a place has no usable name', () => {
    expect(mapPlaceToBusiness({ id: 'x' } as Place)).toBeNull()
  })

  it('maps businessStatus to our lifecycle states', () => {
    expect(lifecycleFromStatus('OPERATIONAL')).toBe('active')
    expect(lifecycleFromStatus('CLOSED_TEMPORARILY')).toBe('temporarily-closed')
    expect(lifecycleFromStatus('CLOSED_PERMANENTLY')).toBe('permanently-closed')
    expect(lifecycleFromStatus(undefined)).toBe('active')
  })

  it('maps opening periods to structured hours (overnight + no-close)', () => {
    const hours = hoursFromPlace(samplePlace)
    expect(hours).toContainEqual({ day: 'monday', opens: '08:00', closes: '16:30' })
    expect(hours).toContainEqual({ day: 'friday', opens: '18:00', closes: '01:00' })

    const always = hoursFromPlace({
      id: 'a',
      regularOpeningHours: { periods: [{ open: { day: 0, hour: 0, minute: 0 } }] },
    } as Place)
    expect(always).toEqual([{ day: 'sunday', opens: '00:00', closes: '23:59' }])
  })

  it('resolves category from primaryType then types', () => {
    expect(categoryLeafFromPlace({ id: 'a', primaryType: 'bakery' } as Place)).toBe('bakery')
    expect(categoryLeafFromPlace({ id: 'a', types: ['food', 'bar'] } as Place)).toBe('bar')
    expect(categoryLeafFromPlace({ id: 'a', types: ['unknown'] } as Place)).toBeUndefined()
  })
})

describe('detectDuplicates() heuristic (FR58)', () => {
  it('flags same-name listings that are physically close', () => {
    const flags = detectDuplicates([
      { id: '1', name: 'The Elm Cafe', location: [-76.4812, 44.2334] },
      { id: '2', name: "the elm  café!", location: [-76.4813, 44.2335] },
    ])
    expect(flags).toEqual([{ duplicateId: '2', ofId: '1' }])
  })

  it('does NOT flag same-name listings that are far apart', () => {
    const flags = detectDuplicates([
      { id: '1', name: 'Tim Hortons', location: [-76.48, 44.23] },
      { id: '2', name: 'Tim Hortons', location: [-76.52, 44.26] },
    ])
    expect(flags).toEqual([])
  })

  it('flags same-name listings when coordinates are missing', () => {
    const flags = detectDuplicates([
      { id: '1', name: 'Olde Mill', location: null },
      { id: '2', name: 'Olde Mill', location: null },
    ])
    expect(flags).toEqual([{ duplicateId: '2', ofId: '1' }])
  })

  it('normalizes names and measures distance sanely', () => {
    expect(normalizeName("Joe's  Café!!")).toBe('joe s cafe')
    expect(Math.round(haversineMeters([-76.48, 44.23], [-76.48, 44.23]))).toBe(0)
  })
})

describe('isStale() (FR58)', () => {
  const now = new Date('2026-06-01T00:00:00Z')
  it('treats never-refreshed / unparseable as stale', () => {
    expect(isStale(null, now)).toBe(true)
    expect(isStale('not-a-date', now)).toBe(true)
  })
  it('is fresh within the window and stale past it', () => {
    const recent = new Date('2026-05-28T00:00:00Z').toISOString()
    const old = new Date('2026-03-01T00:00:00Z').toISOString()
    expect(isStale(recent, now)).toBe(false)
    expect(isStale(old, now)).toBe(true)
    expect(STALE_AFTER_DAYS).toBe(30)
  })
})

describe('searchPlacesText() client', () => {
  const original = process.env.GOOGLE_PLACES_API_KEY
  afterEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = original
  })

  it('throws when the API key is not set', async () => {
    process.env.GOOGLE_PLACES_API_KEY = ''
    await expect(searchPlacesText('coffee')).rejects.toThrow(/GOOGLE_PLACES_API_KEY/)
  })

  it('POSTs to Places (New) with the key, field mask, and text query', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key'
    let captured: { url: string; init: RequestInit } | null = null
    const fakeFetch = (async (url: string, init: RequestInit) => {
      captured = { url, init }
      return { ok: true, json: async () => ({ places: [samplePlace] }) } as Response
    }) as unknown as typeof fetch

    const places = await searchPlacesText('coffee in Kingston', { fetchImpl: fakeFetch })
    expect(places).toHaveLength(1)
    expect(captured!.url).toContain('places:searchText')
    const headers = captured!.init.headers as Record<string, string>
    expect(headers['X-Goog-Api-Key']).toBe('test-key')
    expect(headers['X-Goog-FieldMask']).toBe(SEED_FIELD_MASK)
    expect(JSON.parse(captured!.init.body as string).textQuery).toBe('coffee in Kingston')
  })

  it('throws on a non-2xx response', async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key'
    const fakeFetch = (async () =>
      ({ ok: false, status: 403, text: async () => 'denied' }) as Response) as unknown as typeof fetch
    await expect(searchPlacesText('x', { fetchImpl: fakeFetch })).rejects.toThrow(/403/)
  })
})

describe('directory jobs are registered (AR20)', () => {
  it('registers seed-directory, check-staleness, dedup-flag', () => {
    const slugs = jobTasks.map((t) => t.slug)
    expect(slugs).toContain('seed-directory')
    expect(slugs).toContain('check-staleness')
    expect(slugs).toContain('dedup-flag')
  })
})
