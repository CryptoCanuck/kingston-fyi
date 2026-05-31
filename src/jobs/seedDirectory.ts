import type { Payload, TaskConfig } from 'payload'

import { DEFAULT_CITY_SLUG } from '../lib/city'
import { isPlacesConfigured, searchPlacesText } from '../lib/places/client'
import { mapPlaceToBusiness } from '../lib/places/mapToBusiness'
import { ingestDraftDefaults } from './draftDefaults'

// Kingston city centre — biases Text Search to local results.
const KINGSTON_CENTER = { latitude: 44.2312, longitude: -76.486 }
const SEARCH_RADIUS_M = 12000

// One query per directory facet so the cold-start directory reaches city-wide density.
export const DEFAULT_SEED_QUERIES = [
  'restaurants',
  'cafes',
  'coffee shops',
  'bars',
  'bakeries',
  'bookstores',
  'grocery stores',
  'clothing boutiques',
  'gyms',
  'parks',
  'art galleries',
  'theatres',
  'hair salons',
]

export interface SeedDirectoryResult {
  discovered: number
  created: number
  updated: number
  skipped: number
  configured: boolean
}

export interface SeedDirectoryOptions {
  maxPerQuery?: number
  queries?: string[]
}

/**
 * Discover + refresh Kingston listings from Google Places (FR29, AR22). For each facet query
 * it Text-Searches Places, maps each result, and UPSERTS by place_id within the city:
 *  - new listings are created as DRAFT (ingestDraftDefaults — never auto-published, NFR4),
 *  - existing listings are refreshed in place (matched on place_id — never a second copy).
 * Every record carries provenance `google-places` + refreshRequired, so it's treated as a
 * ToS-bound source to re-fetch, never frozen as ours. Degrades to a no-op (configured:false)
 * when the API key is absent.
 */
export const runSeedDirectory = async (
  payload: Payload,
  options: SeedDirectoryOptions = {},
): Promise<SeedDirectoryResult> => {
  const result: SeedDirectoryResult = {
    discovered: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    configured: isPlacesConfigured(),
  }
  if (!result.configured) {
    payload.logger.warn('[seed-directory] GOOGLE_PLACES_API_KEY not set — skipping')
    return result
  }

  const { maxPerQuery = 20, queries = DEFAULT_SEED_QUERIES } = options

  const { docs: cities } = await payload.find({
    collection: 'cities',
    where: { slug: { equals: DEFAULT_CITY_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const city = cities[0]
  if (!city) throw new Error('[seed-directory] launch city is not seeded')
  const cityId = city.id as string

  // Preload this city's leaf categories so we can resolve a Place's type to a category id.
  const { docs: cats } = await payload.find({
    collection: 'business-categories',
    where: { city: { equals: cityId } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  const catBySlug = new Map<string, unknown>(
    cats.map((c) => [(c as { slug?: string }).slug ?? '', c.id]),
  )

  for (const query of queries) {
    let places
    try {
      places = await searchPlacesText(`${query} in Kingston, Ontario`, {
        maxResultCount: maxPerQuery,
        locationBias: { circle: { center: KINGSTON_CENTER, radius: SEARCH_RADIUS_M } },
      })
    } catch (err) {
      payload.logger.error(`[seed-directory] query "${query}" failed: ${(err as Error).message}`)
      continue
    }

    for (const place of places) {
      result.discovered += 1
      const mapped = mapPlaceToBusiness(place)
      if (!mapped) {
        result.skipped += 1
        continue
      }
      const categoryId = mapped.categoryLeafSlug ? catBySlug.get(mapped.categoryLeafSlug) : undefined

      const data: Record<string, unknown> = {
        name: mapped.name,
        address: mapped.address,
        hours: mapped.hours,
        lifecycleStatus: mapped.lifecycleStatus,
        placeId: mapped.placeId,
        city: cityId,
        provenance: {
          source: 'google-places',
          refreshRequired: true,
          lastRefreshedAt: new Date().toISOString(),
        },
      }
      if (mapped.location) data.location = mapped.location
      if (mapped.phone) data.phone = mapped.phone
      if (mapped.website) data.website = mapped.website
      if (typeof mapped.rating === 'number') data.rating = mapped.rating
      if (typeof mapped.reviewCount === 'number') data.reviewCount = mapped.reviewCount
      if (categoryId) data.category = categoryId

      const { docs: existing } = await payload.find({
        collection: 'businesses',
        where: { and: [{ placeId: { equals: mapped.placeId } }, { city: { equals: cityId } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (existing[0]) {
        // Refresh in place. skipReModeration: a trusted system refresh must not bounce an
        // approved listing back to pending. Owner-locked-field protection lands in Story 5.5.
        await payload.update({
          collection: 'businesses',
          id: existing[0].id,
          data: data as never,
          depth: 0,
          overrideAccess: true,
          context: { skipReModeration: true },
        })
        result.updated += 1
      } else {
        await payload.create({
          collection: 'businesses',
          data: ingestDraftDefaults(data) as never,
          depth: 0,
          overrideAccess: true,
        })
        result.created += 1
      }
    }
  }

  payload.logger.info(
    `[seed-directory] discovered=${result.discovered} created=${result.created} updated=${result.updated} skipped=${result.skipped}`,
  )
  return result
}

/** Jobs Queue task wrapper (AR20). */
export const seedDirectoryTask: TaskConfig<{
  input: { maxPerQuery?: number }
  output: SeedDirectoryResult
}> = {
  slug: 'seed-directory',
  label: 'Seed directory from Google Places',
  inputSchema: [{ name: 'maxPerQuery', type: 'number' }],
  outputSchema: [
    { name: 'discovered', type: 'number' },
    { name: 'created', type: 'number' },
    { name: 'updated', type: 'number' },
    { name: 'skipped', type: 'number' },
    { name: 'configured', type: 'checkbox' },
  ],
  handler: async ({ req, input }) => {
    const output = await runSeedDirectory(req.payload, { maxPerQuery: input?.maxPerQuery })
    return { output }
  },
}
