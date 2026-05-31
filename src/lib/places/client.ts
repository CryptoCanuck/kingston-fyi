// Google Places API (New) client (AR22, FR29). Used ONLY as a discovery + refresh source:
// we store the place_id and refresh on cadence, never a frozen standalone copy, and never
// scrape Maps. Server-side only — the key (GOOGLE_PLACES_API_KEY) must never reach the client.

import type { Place } from './types'

const SEARCH_TEXT_URL = 'https://places.googleapis.com/v1/places:searchText'

/** Field mask covering exactly the Place fields the seeding pipeline maps. */
export const SEED_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.regularOpeningHours',
  'places.types',
  'places.primaryType',
  'places.businessStatus',
  'places.addressComponents',
].join(',')

/** True when the Places API key is configured (jobs degrade gracefully when it isn't). */
export const isPlacesConfigured = (): boolean => Boolean(process.env.GOOGLE_PLACES_API_KEY)

export interface SearchTextOptions {
  /** Comma-separated field mask. Defaults to SEED_FIELD_MASK. */
  fieldMask?: string
  maxResultCount?: number
  /** Bias results to a circle (keeps a city search local). */
  locationBias?: { circle: { center: { latitude: number; longitude: number }; radius: number } }
  /** Override fetch (for tests). */
  fetchImpl?: typeof fetch
}

/**
 * Text Search against Places (New). Returns the `places` array (empty if none). Throws on a
 * missing key or a non-2xx response so callers can log + skip rather than write bad data.
 */
export const searchPlacesText = async (
  textQuery: string,
  options: SearchTextOptions = {},
): Promise<Place[]> => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set')

  const {
    fieldMask = SEED_FIELD_MASK,
    maxResultCount = 20,
    locationBias,
    fetchImpl = fetch,
  } = options

  const res = await fetchImpl(SEARCH_TEXT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({ textQuery, maxResultCount, ...(locationBias ? { locationBias } : {}) }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Places searchText ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as { places?: Place[] }
  return data.places ?? []
}
