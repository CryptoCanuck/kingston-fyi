import { describe, it, expect } from 'vitest'

import {
  buildMetadata,
  canonicalUrl,
  rootMetadata,
  SITE_NAME,
  SITE_DESCRIPTION,
} from '@/lib/seo/metadata'
import {
  buildOrganization,
  buildBreadcrumbList,
  buildLocalBusiness,
  buildNewsArticle,
  buildEvent,
  type LocalBusinessInput,
} from '@/lib/seo/jsonld'
import { hasFacetParam, ROBOTS_DISALLOW } from '@/lib/seo/routes'

const ORIGIN = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

describe('SEO metadata helper (FR6 / NFR1)', () => {
  it('produces canonical URL from origin + path', () => {
    expect(canonicalUrl('/news')).toBe(`${ORIGIN}/news`)
    expect(canonicalUrl('news')).toBe(`${ORIGIN}/news`)
    expect(canonicalUrl()).toBe(ORIGIN)
  })

  it('fills site defaults and canonical for a page', () => {
    const meta = buildMetadata({ title: 'Events', path: '/events' })
    expect(meta.title).toBe('Events')
    expect(meta.description).toBe(SITE_DESCRIPTION)
    expect(meta.alternates?.canonical).toBe(`${ORIGIN}/events`)
  })

  it('uses a page-specific description when provided', () => {
    const meta = buildMetadata({ title: 'X', description: 'A specific desc', path: '/x' })
    expect(meta.description).toBe('A specific desc')
  })

  it('omits canonical when no path is given', () => {
    const meta = buildMetadata({ title: 'No path' })
    expect(meta.alternates).toBeUndefined()
  })

  it('emits noindex robots when flagged (thin/facet gating)', () => {
    const meta = buildMetadata({ title: 'Thin', path: '/x', noindex: true })
    expect(meta.robots).toEqual({ index: false, follow: true })
  })

  it('root metadata sets title template and metadataBase', () => {
    const meta = rootMetadata()
    expect(meta.title).toEqual({ default: SITE_NAME, template: `%s · ${SITE_NAME}` })
    expect(String(meta.metadataBase)).toBe(`${ORIGIN}/`)
  })
})

describe('Site-wide JSON-LD builders (NFR1)', () => {
  it('Organization has correct @type and identity', () => {
    const org = buildOrganization()
    expect(org['@type']).toBe('Organization')
    expect(org['@context']).toBe('https://schema.org')
    expect(org.name).toBe(SITE_NAME)
    expect(org.url).toBe(ORIGIN)
  })

  it('BreadcrumbList has correct @type and 1-based positions', () => {
    const crumbs = buildBreadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news' },
    ])
    expect(crumbs['@type']).toBe('BreadcrumbList')
    const items = crumbs.itemListElement as Array<Record<string, unknown>>
    expect(items).toHaveLength(2)
    expect(items[0]['@type']).toBe('ListItem')
    expect(items[0].position).toBe(1)
    expect(items[1].position).toBe(2)
    expect(items[1].item).toBe(`${ORIGIN}/news`)
  })

  it('NewsArticle and Event builders emit correct @type', () => {
    expect(buildNewsArticle({ headline: 'H', path: '/news/a/b' })['@type']).toBe('NewsArticle')
    const event = buildEvent({
      name: 'E',
      path: '/events/e',
      startDate: '2026-06-01T18:00:00-04:00',
      location: { name: 'Springer Market Square' },
    })
    expect(event['@type']).toBe('Event')
    expect((event.location as Record<string, unknown>)['@type']).toBe('Place')
  })
})

describe('LocalBusiness JSON-LD — NO self-serving aggregateRating (NFR1 guardrail / FR28)', () => {
  it('emits the most-specific subtype', () => {
    const node = buildLocalBusiness({ name: 'Cafe X', path: '/business/cafe-x', subtype: 'CafeOrCoffeeShop' })
    expect(node['@type']).toBe('CafeOrCoffeeShop')
  })

  it('NEVER includes aggregateRating, even when passed rating-ish input', () => {
    // Force rating-like keys through the permissive input — output must still omit them.
    const ratingish = {
      name: 'Rated Co',
      path: '/business/rated-co',
      aggregateRating: { '@type': 'AggregateRating', ratingValue: 4.9, reviewCount: 1000 },
      ratingValue: 4.9,
      reviewCount: 1000,
      review: [{ '@type': 'Review', reviewRating: { ratingValue: 5 } }],
    } as unknown as LocalBusinessInput

    const node = buildLocalBusiness(ratingish)

    expect(node).not.toHaveProperty('aggregateRating')
    expect(node).not.toHaveProperty('ratingValue')
    expect(node).not.toHaveProperty('reviewCount')
    expect(node).not.toHaveProperty('review')
    // Belt-and-suspenders: serialized output contains no rating string at all.
    expect(JSON.stringify(node).toLowerCase()).not.toContain('aggregaterating')
    expect(JSON.stringify(node).toLowerCase()).not.toContain('ratingvalue')
  })
})

describe('Crawl-control helpers (NFR1 facet gating)', () => {
  it('detects facet query params', () => {
    expect(hasFacetParam('/directory?category=cafe')).toBe(true)
    expect(hasFacetParam('/directory')).toBe(false)
    expect(hasFacetParam('page=2&sort=new')).toBe(true)
  })

  it('robots disallow covers admin, api, and facet params', () => {
    expect(ROBOTS_DISALLOW).toContain('/admin')
    expect(ROBOTS_DISALLOW).toContain('/api/')
    expect(ROBOTS_DISALLOW.some((p) => p.includes('category='))).toBe(true)
  })
})
