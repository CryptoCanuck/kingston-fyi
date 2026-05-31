import { describe, it, expect } from 'vitest'

import {
  parseEventFilters,
  serializeEventFilters,
  matchesEvent,
  activeEventFilterCount,
  EMPTY_EVENT_FILTERS,
} from '@/lib/events/filters'

const NOW = new Date('2026-06-11T16:00:00.000Z') // Thu

describe('parse/serialize event filters (FR16)', () => {
  it('round-trips through the query string, dropping defaults', () => {
    const state = { preset: 'weekend' as const, cats: ['music', 'arts'], hood: 'downtown', price: 'free' as const }
    const qs = serializeEventFilters(state)
    expect(parseEventFilters(Object.fromEntries(new URLSearchParams(qs)))).toEqual(state)
    expect(serializeEventFilters(EMPTY_EVENT_FILTERS)).toBe('')
  })

  it('falls back to safe defaults for junk input', () => {
    const f = parseEventFilters({ date: 'whenever', price: 'cheap' })
    expect(f.preset).toBe('any')
    expect(f.price).toBe('all')
  })
})

describe('matchesEvent (FR16)', () => {
  const ev = {
    startsAt: '2026-06-13T18:00:00.000Z', // Sat — weekend bucket
    isFree: false,
    category: { slug: 'music' },
    neighbourhood: { slug: 'downtown' },
  }

  it('applies date preset, category, neighbourhood and price', () => {
    expect(matchesEvent(ev, { ...EMPTY_EVENT_FILTERS, preset: 'weekend' }, NOW)).toBe(true)
    expect(matchesEvent(ev, { ...EMPTY_EVENT_FILTERS, preset: 'today' }, NOW)).toBe(false)
    expect(matchesEvent(ev, { ...EMPTY_EVENT_FILTERS, cats: ['arts'] }, NOW)).toBe(false)
    expect(matchesEvent(ev, { ...EMPTY_EVENT_FILTERS, hood: 'west-end' }, NOW)).toBe(false)
    expect(matchesEvent(ev, { ...EMPTY_EVENT_FILTERS, price: 'free' }, NOW)).toBe(false)
    expect(matchesEvent({ ...ev, isFree: true }, { ...EMPTY_EVENT_FILTERS, price: 'free' }, NOW)).toBe(true)
  })

  it('never matches past events', () => {
    expect(matchesEvent({ ...ev, startsAt: '2026-06-01T18:00:00.000Z' }, EMPTY_EVENT_FILTERS, NOW)).toBe(false)
  })

  it('counts active filters', () => {
    expect(activeEventFilterCount({ preset: 'weekend', cats: ['music'], hood: 'downtown', price: 'free' })).toBe(4)
    expect(activeEventFilterCount(EMPTY_EVENT_FILTERS)).toBe(0)
  })
})
