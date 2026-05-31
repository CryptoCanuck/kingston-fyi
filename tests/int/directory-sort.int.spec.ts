import { describe, it, expect } from 'vitest'

import {
  sortBusinesses,
  parseSortKey,
  SORT_KEYS,
  DEFAULT_SORT,
  type SortableBusiness,
} from '@/lib/directory/sort'

const items: SortableBusiness[] = [
  { id: 'a', name: 'Zed Bar', rating: 4.0, reviewCount: 10, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'b', name: 'Alpha Cafe', rating: 4.8, reviewCount: 500, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'c', name: 'Beta Diner', rating: null, reviewCount: null, createdAt: '2026-03-01T00:00:00Z' },
  { id: 'd', name: 'Mid Grill', rating: 4.8, reviewCount: 5, createdAt: '2026-02-01T00:00:00Z' },
]

const ids = (list: SortableBusiness[]) => list.map((b) => b.id)

describe('parseSortKey()', () => {
  it('accepts valid keys and defaults otherwise', () => {
    for (const k of SORT_KEYS) expect(parseSortKey(k)).toBe(k)
    expect(parseSortKey('bogus')).toBe(DEFAULT_SORT)
    expect(parseSortKey(undefined)).toBe(DEFAULT_SORT)
  })
})

describe('sortBusinesses() — null-safe (FR23)', () => {
  it('rating: highest first, equal ratings broken by review count, nulls last', () => {
    const out = ids(sortBusinesses(items, 'rating'))
    expect(out.slice(0, 3)).toEqual(['b', 'd', 'a']) // 4.8(500), 4.8(5), 4.0
    expect(out[out.length - 1]).toBe('c') // null rating last
  })

  it('relevance: rating × review volume, unrated last', () => {
    const out = ids(sortBusinesses(items, 'relevance'))
    expect(out[0]).toBe('b') // 4.8 × ln(501) dominates
    expect(out[out.length - 1]).toBe('c')
  })

  it('az: case-insensitive alphabetical', () => {
    expect(ids(sortBusinesses(items, 'az'))).toEqual(['b', 'c', 'd', 'a'])
  })

  it('newest: most recent createdAt first', () => {
    expect(ids(sortBusinesses(items, 'newest'))).toEqual(['b', 'c', 'd', 'a'])
  })

  it('distance: nearest first, missing distances last', () => {
    const distanceById = new Map([
      ['a', 1500],
      ['b', 300],
      ['d', 900],
    ]) // c has no distance
    const out = ids(sortBusinesses(items, 'distance', { distanceById }))
    expect(out).toEqual(['b', 'd', 'a', 'c'])
  })

  it('distance with no location data falls back to relevance', () => {
    expect(ids(sortBusinesses(items, 'distance'))).toEqual(ids(sortBusinesses(items, 'relevance')))
  })

  it('does not mutate the input array', () => {
    const before = ids(items)
    sortBusinesses(items, 'az')
    expect(ids(items)).toEqual(before)
  })
})
