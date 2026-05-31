// Pure mapping: a Google Place → the normalized fields our Businesses collection stores
// (FR29, AR22). No I/O here so it's fully unit-testable. The job layer resolves the category
// slug to a Payload id, applies provenance + draft status, and upserts by placeId.

import type { OpeningInterval, Weekday } from '../openNow'
import type { Place, PlacesAddressComponent, PlacesBusinessStatus } from './types'

export type LifecycleStatus =
  | 'active'
  | 'temporarily-closed'
  | 'permanently-closed'
  | 'stale-unverified'

export interface MappedBusinessAddress {
  street?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
}

export interface MappedBusiness {
  placeId: string
  name: string
  /** [longitude, latitude] — Payload point order. */
  location?: [number, number]
  address: MappedBusinessAddress
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  hours: OpeningInterval[]
  lifecycleStatus: LifecycleStatus
  /** Our taxonomy leaf slug (e.g. `coffee-shop`), or undefined if unmapped. */
  categoryLeafSlug?: string
}

// Places `day` index → our weekday name (0 = Sunday … 6 = Saturday).
const PLACES_DAY: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

// Google Place type → our directory leaf-category slug (seedTaxonomies slugs).
export const GOOGLE_TYPE_TO_LEAF: Record<string, string> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  coffee_shop: 'coffee-shop',
  bar: 'bar',
  pub: 'bar',
  bakery: 'bakery',
  book_store: 'bookstore',
  grocery_store: 'grocery',
  supermarket: 'grocery',
  clothing_store: 'boutique',
  gym: 'gym',
  fitness_center: 'gym',
  park: 'park',
  art_gallery: 'gallery',
  performing_arts_theater: 'theatre',
  movie_theater: 'theatre',
  beauty_salon: 'salon',
  hair_salon: 'salon',
  hair_care: 'salon',
}

export const lifecycleFromStatus = (status?: PlacesBusinessStatus): LifecycleStatus => {
  switch (status) {
    case 'CLOSED_TEMPORARILY':
      return 'temporarily-closed'
    case 'CLOSED_PERMANENTLY':
      return 'permanently-closed'
    default:
      return 'active'
  }
}

const pad = (n: number): string => String(n).padStart(2, '0')
const hhmm = (hour: number, minute: number): string => `${pad(hour)}:${pad(minute)}`

/** Map Places opening periods to our structured `hours` intervals. */
export const hoursFromPlace = (place: Place): OpeningInterval[] => {
  const periods = place.regularOpeningHours?.periods
  if (!periods || periods.length === 0) return []
  const intervals: OpeningInterval[] = []
  for (const period of periods) {
    if (!period.open) continue
    const day = PLACES_DAY[period.open.day]
    if (!day) continue
    const opens = hhmm(period.open.hour, period.open.minute)
    // No close → treat as open through end of day (covers always-open / 24h-ish entries).
    const closes = period.close ? hhmm(period.close.hour, period.close.minute) : '23:59'
    intervals.push({ day, opens, closes })
  }
  return intervals
}

const componentValue = (
  components: PlacesAddressComponent[] | undefined,
  type: string,
  prefer: 'long' | 'short' = 'long',
): string | undefined => {
  const match = components?.find((c) => c.types?.includes(type))
  if (!match) return undefined
  return prefer === 'short' ? match.shortText : match.longText
}

/** Build a structured address from Places addressComponents (only present keys). */
export const addressFromPlace = (place: Place): MappedBusinessAddress => {
  const c = place.addressComponents
  const streetNumber = componentValue(c, 'street_number')
  const route = componentValue(c, 'route')
  const street = [streetNumber, route].filter(Boolean).join(' ') || undefined
  const address: MappedBusinessAddress = {}
  if (street) address.street = street
  const locality = componentValue(c, 'locality') ?? componentValue(c, 'postal_town')
  if (locality) address.locality = locality
  const region = componentValue(c, 'administrative_area_level_1', 'short')
  if (region) address.region = region
  const postalCode = componentValue(c, 'postal_code')
  if (postalCode) address.postalCode = postalCode
  const country = componentValue(c, 'country', 'short')
  if (country) address.country = country
  return address
}

/** Resolve our leaf-category slug from a Place's primaryType / types. */
export const categoryLeafFromPlace = (place: Place): string | undefined => {
  if (place.primaryType && GOOGLE_TYPE_TO_LEAF[place.primaryType]) {
    return GOOGLE_TYPE_TO_LEAF[place.primaryType]
  }
  for (const type of place.types ?? []) {
    if (GOOGLE_TYPE_TO_LEAF[type]) return GOOGLE_TYPE_TO_LEAF[type]
  }
  return undefined
}

/** Map a Place to our normalized business shape. Returns null if it lacks a usable name. */
export const mapPlaceToBusiness = (place: Place): MappedBusiness | null => {
  const name = place.displayName?.text?.trim()
  if (!place.id || !name) return null

  const mapped: MappedBusiness = {
    placeId: place.id,
    name,
    address: addressFromPlace(place),
    hours: hoursFromPlace(place),
    lifecycleStatus: lifecycleFromStatus(place.businessStatus),
  }

  if (place.location) mapped.location = [place.location.longitude, place.location.latitude]
  const phone = place.nationalPhoneNumber ?? place.internationalPhoneNumber
  if (phone) mapped.phone = phone
  if (place.websiteUri) mapped.website = place.websiteUri
  if (typeof place.rating === 'number') mapped.rating = place.rating
  if (typeof place.userRatingCount === 'number') mapped.reviewCount = place.userRatingCount
  const leaf = categoryLeafFromPlace(place)
  if (leaf) mapped.categoryLeafSlug = leaf

  return mapped
}
