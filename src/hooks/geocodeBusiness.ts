import type { CollectionBeforeChangeHook } from 'payload'

import { geocodeAddress, isGeocodingConfigured } from '../lib/geocoding'

// Bias geocoding toward Kingston so ambiguous addresses resolve locally.
const KINGSTON_PROXIMITY: [number, number] = [-76.486, 44.2312]

interface BusinessAddress {
  street?: string | null
  locality?: string | null
  region?: string | null
  postalCode?: string | null
  country?: string | null
}

/** Compose a geocodable query string from a business address group (null if too sparse). */
export const addressToQuery = (address: BusinessAddress | null | undefined): string | null => {
  if (!address) return null
  const parts = [address.street, address.locality, address.region, address.postalCode, address.country]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

/**
 * Backfill coordinates for a listing that has an address but no point (FR24, AR24). Runs only
 * when geocoding is configured and `location` is empty, so Places-seeded listings (which carry
 * geometry) are untouched. A geocoding miss leaves the record unchanged — never blocks a save.
 */
export const geocodeMissingLocation = (): CollectionBeforeChangeHook => {
  return async ({ data }) => {
    if (!data) return data
    const hasLocation = Array.isArray(data.location) && data.location.length === 2
    if (hasLocation || !isGeocodingConfigured()) return data

    const query = addressToQuery(data.address as BusinessAddress | undefined)
    if (!query) return data

    const coords = await geocodeAddress(query, { proximity: KINGSTON_PROXIMITY })
    if (coords) data.location = coords
    return data
  }
}
