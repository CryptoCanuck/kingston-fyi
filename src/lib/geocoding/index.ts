// Forward geocoding via MapTiler (AR24, FR24). Used to resolve coordinates for listings that
// arrive without them — public submissions, manual entries, open-data imports (Places-sourced
// listings already carry geometry, so they skip this). Server-side only; degrades to null on
// any failure so it can never block a save.

const GEOCODE_BASE = 'https://api.maptiler.com/geocoding'

export const isGeocodingConfigured = (): boolean => Boolean(process.env.MAPTILER_GEOCODING_KEY)

export interface GeocodeOptions {
  /** ISO country filter (default `ca`). */
  country?: string
  /** Bias results toward a point: [lng, lat]. */
  proximity?: [number, number]
  fetchImpl?: typeof fetch
}

/**
 * Geocode a free-form address to `[longitude, latitude]`, or null when unconfigured / not
 * found / on error. Never throws — callers (hooks) must not be blocked by a geocoding miss.
 */
export const geocodeAddress = async (
  query: string,
  options: GeocodeOptions = {},
): Promise<[number, number] | null> => {
  const key = process.env.MAPTILER_GEOCODING_KEY
  if (!key || !query.trim()) return null

  const { country = 'ca', proximity, fetchImpl = fetch } = options
  const params = new URLSearchParams({ key, limit: '1', country })
  if (proximity) params.set('proximity', `${proximity[0]},${proximity[1]}`)
  const url = `${GEOCODE_BASE}/${encodeURIComponent(query)}.json?${params.toString()}`

  try {
    const res = await fetchImpl(url)
    if (!res.ok) return null
    const data = (await res.json()) as {
      features?: { center?: number[]; geometry?: { coordinates?: number[] } }[]
    }
    const feature = data.features?.[0]
    const coords = feature?.center ?? feature?.geometry?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return null
    return [Number(coords[0]), Number(coords[1])]
  } catch {
    return null
  }
}
