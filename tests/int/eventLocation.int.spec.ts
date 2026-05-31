import { describe, it, expect } from 'vitest'

import { resolveEventPlace, eventHasCoordinates } from '@/lib/events/location'
import { buildEventJsonLd } from '@/lib/seo/event'

// Pure coverage for the FR62 "always located" guarantee. No database needed.
describe('resolveEventPlace (FR62)', () => {
  it('inherits a linked venue business place + coordinates', () => {
    const place = resolveEventPlace({
      title: 'Trivia Night',
      venue: {
        name: 'The Merchant',
        address: { street: '18 Princess St', locality: 'Kingston', region: 'ON' },
        location: [-76.481, 44.231],
      },
      // own fields should be ignored when a venue is present
      locationName: 'ignored',
      location: [0, 0],
    })
    expect(place.name).toBe('The Merchant')
    expect(place.streetAddress).toBe('18 Princess St')
    expect(place).toMatchObject({ latitude: 44.231, longitude: -76.481 })
  })

  it('falls back to the event own location when there is no venue', () => {
    const place = resolveEventPlace({
      title: 'Market Square Concert',
      locationName: 'Springer Market Square',
      address: { locality: 'Kingston', region: 'ON' },
      location: [-76.482, 44.229],
    })
    expect(place.name).toBe('Springer Market Square')
    expect(place).toMatchObject({ latitude: 44.229, longitude: -76.482 })
  })

  it('always yields a named place even without coordinates', () => {
    const place = resolveEventPlace({ title: 'Pop-up' })
    expect(place.name).toBe('Kingston')
    expect(place.latitude).toBeUndefined()
    expect(eventHasCoordinates({ title: 'Pop-up' })).toBe(false)
  })
})

describe('buildEventJsonLd (FR18)', () => {
  it('always emits a located Event node', () => {
    const node = buildEventJsonLd({
      title: 'Trivia Night',
      path: '/events/trivia-night',
      startsAt: '2026-06-14T23:00:00.000Z',
      endsAt: '2026-06-15T01:00:00.000Z',
      blurb: 'Weekly pub trivia.',
      venue: { name: 'The Merchant', location: [-76.481, 44.231] },
    }) as Record<string, unknown>
    expect(node['@type']).toBe('Event')
    expect(node.startDate).toBe('2026-06-14T23:00:00.000Z')
    expect(node.endDate).toBe('2026-06-15T01:00:00.000Z')
    const location = node.location as Record<string, unknown>
    expect(location['@type']).toBe('Place')
    expect(location.name).toBe('The Merchant')
    expect(location.geo).toMatchObject({ latitude: 44.231, longitude: -76.481 })
  })
})
