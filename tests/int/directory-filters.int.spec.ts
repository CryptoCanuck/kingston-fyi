import { describe, it, expect } from 'vitest'

import {
  parseFilters,
  serializeFilters,
  matchesBusiness,
  buildCategoryTree,
  activeFilterChips,
  activeFilterCount,
  type DirectoryBusiness,
  type FilterState,
} from '@/lib/directory/filters'

describe('parseFilters() / serializeFilters() (FR21/FR26)', () => {
  it('parses params into typed state', () => {
    const f = parseFilters({
      q: 'coffee',
      cat: 'cafe,bakery',
      hood: 'downtown',
      rating: '4.5',
      open: '1',
      price: '$$',
      sort: 'rating',
      page: '2',
    })
    expect(f).toEqual({
      q: 'coffee',
      cats: ['cafe', 'bakery'],
      hood: 'downtown',
      minRating: 4.5,
      openNow: true,
      prices: ['$$'],
      sort: 'rating',
      page: 2,
    })
  })

  it('applies safe defaults for missing/invalid params', () => {
    const f = parseFilters({})
    expect(f).toEqual({
      q: '',
      cats: [],
      hood: null,
      minRating: 0,
      openNow: false,
      prices: [],
      sort: 'relevance',
      page: 1,
    })
  })

  it('round-trips through serialize (omitting defaults)', () => {
    const state: FilterState = {
      q: 'pizza',
      cats: ['restaurant'],
      hood: 'sydenham',
      minRating: 4,
      openNow: true,
      prices: ['$', '$$'],
      sort: 'az',
      page: 3,
    }
    expect(parseFilters(Object.fromEntries(new URLSearchParams(serializeFilters(state))))).toEqual(state)
  })

  it('omits default values from the query string', () => {
    expect(serializeFilters({ sort: 'relevance', page: 1, minRating: 0 })).toBe('')
  })
})

const biz = (over: Partial<DirectoryBusiness>): DirectoryBusiness => ({
  id: 'x',
  name: 'Test',
  category: { slug: 'cafe', name: 'Cafe' },
  neighbourhood: { slug: 'downtown', name: 'Downtown' },
  rating: 4.6,
  priceTier: '$$',
  hours: [{ day: 'monday', opens: '08:00', closes: '17:00' }],
  ...over,
})

describe('matchesBusiness() (FR21)', () => {
  const base = parseFilters({})
  const monday10 = new Date('2026-06-01T14:00:00Z') // Mon 10:00 EDT

  it('matches when no filters are set', () => {
    expect(matchesBusiness(biz({}), base, monday10)).toBe(true)
  })
  it('filters by category slug', () => {
    expect(matchesBusiness(biz({}), { ...base, cats: ['bakery'] })).toBe(false)
    expect(matchesBusiness(biz({}), { ...base, cats: ['cafe'] })).toBe(true)
  })
  it('filters by neighbourhood, price, and min rating', () => {
    expect(matchesBusiness(biz({}), { ...base, hood: 'sydenham' })).toBe(false)
    expect(matchesBusiness(biz({}), { ...base, prices: ['$$$'] })).toBe(false)
    expect(matchesBusiness(biz({ rating: 4.2 }), { ...base, minRating: 4.5 })).toBe(false)
    expect(matchesBusiness(biz({ rating: null }), { ...base, minRating: 4.5 })).toBe(false)
  })
  it('filters by Open Now', () => {
    expect(matchesBusiness(biz({}), { ...base, openNow: true }, monday10)).toBe(true)
    const tuesday = new Date('2026-06-02T14:00:00Z')
    expect(matchesBusiness(biz({}), { ...base, openNow: true }, tuesday)).toBe(false)
  })
  it('text query matches name / blurb / category / neighbourhood', () => {
    expect(matchesBusiness(biz({ name: 'Elm Cafe' }), { ...base, q: 'elm' })).toBe(true)
    expect(matchesBusiness(biz({}), { ...base, q: 'downtown' })).toBe(true)
    expect(matchesBusiness(biz({}), { ...base, q: 'zzz' })).toBe(false)
  })
})

describe('buildCategoryTree()', () => {
  it('nests leaves under their parent, sorted', () => {
    const tree = buildCategoryTree([
      { id: 'p1', slug: 'food-and-drink', name: 'Food & Drink' },
      { id: 'c1', slug: 'restaurant', name: 'Restaurant', parent: 'p1' },
      { id: 'c2', slug: 'cafe', name: 'Cafe', parent: { id: 'p1' } },
      { id: 'p2', slug: 'shopping', name: 'Shopping' },
      { id: 'c3', slug: 'bookstore', name: 'Bookstore', parent: 'p2' },
    ])
    expect(tree).toHaveLength(2)
    expect(tree[0].parent.name).toBe('Food & Drink')
    expect(tree[0].children.map((c) => c.slug)).toEqual(['cafe', 'restaurant'])
  })
})

describe('activeFilterChips() / activeFilterCount() (FR26)', () => {
  it('produces a removable chip per active facet', () => {
    const f = parseFilters({ q: 'pie', cat: 'cafe', hood: 'downtown', rating: '4', open: '1', price: '$' })
    const chips = activeFilterChips(f, { cafe: 'Cafe' }, { downtown: 'Downtown' })
    expect(chips.map((c) => c.key)).toEqual(['q', 'open', 'hood', 'rating', 'cat:cafe', 'price:$'])
    expect(activeFilterCount(f)).toBe(6)
    // removing a chip clears just that facet and resets page
    const removeCat = chips.find((c) => c.key === 'cat:cafe')!
    expect(removeCat.next.cats).toEqual([])
    expect(removeCat.label).toBe('Cafe')
  })
})
