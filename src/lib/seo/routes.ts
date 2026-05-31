// Route registry + crawl-control helpers for sitemap.ts / robots.ts (NFR1).
//
// Static pillar routes are defined here. Content collections (articles/events/businesses)
// do not exist yet — `SITEMAP_CONTENT_COLLECTIONS` is the framework slot later epics plug
// into: each entry declares a Payload collection + how to turn a doc into a sitemap path.
// The sitemap queries only PUBLISHED, city-scoped docs (overrideAccess + explicit filter).

import type { Payload } from 'payload'
import type { Where } from 'payload'

import { PUBLIC_STATUSES } from '@/fields/statusField'

/** Static, always-present routes (the pillar hubs). */
export const STATIC_ROUTES: readonly string[] = ['/', '/news', '/events', '/directory']

/**
 * Query-parameter keys that produce thin/duplicative facet pages. Sitemap omits them and
 * robots disallows crawling URLs that carry them (NFR1 filter/facet crawl control). Later
 * epics (directory filters, news/event category facets) extend this list.
 */
export const FACET_QUERY_PARAMS: readonly string[] = [
  'page',
  'sort',
  'filter',
  'category',
  'tag',
  'neighbourhood',
  'open',
  'price',
  'q',
]

/** robots `disallow` patterns. Admin/API are never crawled; facet params are gated. */
export const ROBOTS_DISALLOW: readonly string[] = [
  '/admin',
  '/api/',
  // Disallow any URL carrying a facet/filter query param (thin/duplicative pages).
  ...FACET_QUERY_PARAMS.map((p) => `/*?*${p}=`),
]

/** True when a path/URL carries a facet query param (used to mark routes noindex). */
export const hasFacetParam = (urlOrSearch: string): boolean => {
  const query = urlOrSearch.includes('?') ? urlOrSearch.split('?')[1] : urlOrSearch
  if (!query) return false
  const params = new URLSearchParams(query)
  return FACET_QUERY_PARAMS.some((p) => params.has(p))
}

/**
 * Describes a city-scoped, published content collection for the sitemap. Later epics add
 * one entry per content collection as it lands (e.g. articles → `/news/{category}/{slug}`).
 */
export interface SitemapContentCollection {
  /** Payload collection slug. */
  collection: string
  /** Map a fetched doc to a site-relative path. Return null to skip a doc. */
  toPath: (doc: Record<string, unknown>) => string | null
  /** Field used for `lastModified` (defaults to `updatedAt`). */
  lastModifiedField?: string
}

/**
 * Content collections to include in the sitemap. EMPTY until the news/events/directory
 * epics register their collections here. This keeps the sitemap framework live now and
 * makes later wiring a one-line addition — no sitemap.ts changes needed.
 */
export const SITEMAP_CONTENT_COLLECTIONS: SitemapContentCollection[] = []

export interface SitemapEntry {
  url: string
  lastModified?: Date
}

/**
 * Fetch sitemap entries for all registered content collections, restricted to PUBLISHED
 * docs in the given city. Uses the Local API with `overrideAccess: true` and an EXPLICIT
 * published + city Where filter (so it never depends on request-bound access). Collections
 * that don't exist yet are skipped gracefully, so this is safe to run pre-content-epics.
 */
export const fetchContentSitemapEntries = async (
  payload: Payload,
  cityId: string,
  origin: string,
): Promise<SitemapEntry[]> => {
  const entries: SitemapEntry[] = []

  for (const spec of SITEMAP_CONTENT_COLLECTIONS) {
    const where: Where = {
      and: [{ status: { in: PUBLIC_STATUSES } }, { city: { equals: cityId } }],
    }
    try {
      const { docs } = await payload.find({
        collection: spec.collection as never,
        where,
        limit: 0, // all matching docs
        depth: 0,
        overrideAccess: true,
        pagination: false,
      })
      for (const doc of docs as Record<string, unknown>[]) {
        const path = spec.toPath(doc)
        if (!path) continue
        const lmRaw = doc[spec.lastModifiedField ?? 'updatedAt']
        entries.push({
          url: `${origin}${path}`,
          lastModified: typeof lmRaw === 'string' ? new Date(lmRaw) : undefined,
        })
      }
    } catch {
      // Collection not registered in Payload yet (pre-content epic) — skip it.
      continue
    }
  }

  return entries
}
