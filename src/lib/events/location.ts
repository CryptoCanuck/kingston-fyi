// Event location resolution (FR62). Every event must resolve to a location for the map and
// Event JSON-LD: it inherits its venue business's place when linked, otherwise uses its own
// address + coordinates. Pure and null-safe so it can back both the detail page and JSON-LD.

interface AddressGroup {
  street?: string | null
  locality?: string | null
  region?: string | null
  postalCode?: string | null
  country?: string | null
}

interface VenueLike {
  name?: string | null
  address?: AddressGroup | null
  /** Payload point: [longitude, latitude]. */
  location?: [number, number] | null
}

export interface EventLocationSource {
  title?: string | null
  locationName?: string | null
  address?: AddressGroup | null
  location?: [number, number] | null
  /** Populated venue (depth ≥ 1) or a bare id; only an object contributes its place. */
  venue?: VenueLike | string | null
}

export interface EventPlace {
  name: string
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  latitude?: number
  longitude?: number
}

const coords = (point: [number, number] | null | undefined): { latitude?: number; longitude?: number } => {
  if (!Array.isArray(point) || point.length !== 2) return {}
  const [lng, lat] = point
  if (typeof lng !== 'number' || typeof lat !== 'number') return {}
  return { latitude: lat, longitude: lng }
}

/**
 * Resolve an event's place, preferring its linked venue business and falling back to its own
 * location. Always returns a named Place (so the Event JSON-LD is always located, FR18/FR62)
 * even when coordinates are absent.
 */
export const resolveEventPlace = (event: EventLocationSource): EventPlace => {
  const venue = event.venue && typeof event.venue === 'object' ? event.venue : null
  const address = venue?.address ?? event.address ?? null
  const point = venue?.location ?? event.location ?? null
  const name =
    venue?.name ??
    event.locationName ??
    address?.locality ??
    'Kingston'

  return {
    name,
    ...(address?.street ? { streetAddress: address.street } : {}),
    ...(address?.locality ? { addressLocality: address.locality } : {}),
    ...(address?.region ? { addressRegion: address.region } : {}),
    ...(address?.postalCode ? { postalCode: address.postalCode } : {}),
    ...coords(point),
  }
}

/** Whether the event resolves to real map coordinates (venue or own). */
export const eventHasCoordinates = (event: EventLocationSource): boolean => {
  const place = resolveEventPlace(event)
  return place.latitude !== undefined && place.longitude !== undefined
}
