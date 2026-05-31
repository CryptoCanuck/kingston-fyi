// LocalBusiness structured-data mapping (FR28, NFR1). Resolves a directory listing's
// category to the most-specific schema.org LocalBusiness subtype and adapts a business
// record into the centralized `buildLocalBusiness` builder. Like every JSON-LD path, this
// NEVER emits `aggregateRating` — the guarantee lives in `buildLocalBusiness` (jsonld.ts),
// which constructs output from an allowlist that excludes rating fields entirely.

import { type JsonLd, type LocalBusinessInput, buildLocalBusiness } from './jsonld'

/**
 * Leaf-category slug → most-specific schema.org LocalBusiness subtype. Keyed by the
 * slugified leaf category name (see seedTaxonomies). Extend as the taxonomy grows.
 */
export const LOCAL_BUSINESS_SUBTYPES: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'CafeOrCoffeeShop',
  'coffee-shop': 'CafeOrCoffeeShop',
  bar: 'BarOrPub',
  bakery: 'Bakery',
  bookstore: 'BookStore',
  grocery: 'GroceryStore',
  boutique: 'ClothingStore',
  gym: 'ExerciseGym',
  park: 'Park',
  gallery: 'ArtGallery',
  theatre: 'PerformingArtsTheater',
  'music-venue': 'EntertainmentBusiness',
  salon: 'HairSalon',
  'professional-services': 'ProfessionalService',
}

/** Parent-category slug fallback when a leaf has no specific mapping. */
export const PARENT_SUBTYPE_FALLBACKS: Record<string, string> = {
  'food-and-drink': 'FoodEstablishment',
  shopping: 'Store',
  recreation: 'SportsActivityLocation',
  'arts-and-culture': 'EntertainmentBusiness',
  services: 'ProfessionalService',
}

/**
 * Resolve the most-specific LocalBusiness subtype for a listing (FR28). Tries the leaf
 * category, then the parent category, then the generic `LocalBusiness`.
 */
export const localBusinessSubtype = (
  leafSlug?: string | null,
  parentSlug?: string | null,
): string => {
  if (leafSlug && LOCAL_BUSINESS_SUBTYPES[leafSlug]) return LOCAL_BUSINESS_SUBTYPES[leafSlug]
  if (parentSlug && PARENT_SUBTYPE_FALLBACKS[parentSlug]) return PARENT_SUBTYPE_FALLBACKS[parentSlug]
  return 'LocalBusiness'
}

/** Structural input for the business JSON-LD adapter (decoupled from generated types). */
export interface BusinessJsonLdSource {
  name: string
  /** Site-relative canonical path to the business detail page. */
  path: string
  blurb?: string | null
  telephone?: string | null
  website?: string | null
  address?: LocalBusinessInput['address']
  /** Coordinates as Payload stores them: `[longitude, latitude]`. */
  location?: [number, number] | null
  imageUrls?: string[]
  /** Slugified leaf category name (e.g. `coffee-shop`). */
  categoryLeafSlug?: string | null
  /** Slugified parent category name (e.g. `food-and-drink`). */
  categoryParentSlug?: string | null
}

/**
 * Build LocalBusiness JSON-LD for a directory listing (FR28). Emits the most-specific
 * subtype and — by delegating to `buildLocalBusiness` — never emits `aggregateRating`.
 */
export const buildBusinessJsonLd = (source: BusinessJsonLdSource): JsonLd => {
  const [longitude, latitude] = source.location ?? [undefined, undefined]
  return buildLocalBusiness({
    name: source.name,
    path: source.path,
    subtype: localBusinessSubtype(source.categoryLeafSlug, source.categoryParentSlug),
    description: source.blurb ?? undefined,
    telephone: source.telephone ?? undefined,
    website: source.website ?? undefined,
    address: source.address,
    latitude,
    longitude,
    imageUrls: source.imageUrls,
  })
}
