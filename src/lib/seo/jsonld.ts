// Centralized JSON-LD builders (FR6, FR11, FR18, FR28, NFR1). Structured data is emitted
// ONLY through these builders — never ad-hoc per feature (architecture enforcement rule).
//
// Site-wide types (Organization, BreadcrumbList) are fully implemented here and rendered
// in the frontend layout. Per-entity builders (NewsArticle, Event, LocalBusiness) are
// typed slots that later epics (news/events/directory) fill in.

import { SITE_NAME, SITE_URL, canonicalUrl } from './metadata'

/** Minimal JSON-LD node shape. All builders return a plain, serializable object. */
export type JsonLd = Record<string, unknown>

/** Stable @id for the site Organization node, referenceable by other nodes. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export interface OrganizationInput {
  /** Logo URL (absolute or path). Optional until brand assets land. */
  logo?: string
  /** Social / canonical profile URLs. */
  sameAs?: string[]
}

/**
 * Site-wide Organization JSON-LD (NFR1). Rendered once, site-wide, in the layout.
 */
export const buildOrganization = (input: OrganizationInput = {}): JsonLd => {
  const { logo, sameAs } = input
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  }
  if (logo) node.logo = logo.startsWith('http') ? logo : canonicalUrl(logo)
  if (sameAs && sameAs.length > 0) node.sameAs = sameAs
  return node
}

export interface BreadcrumbItem {
  /** Human-readable label for the crumb. */
  name: string
  /** Path (with leading slash) or absolute URL. The last crumb may omit it. */
  path?: string
}

/**
 * BreadcrumbList JSON-LD (NFR1) from an ordered list of crumbs. Positions are 1-based;
 * relative paths are made absolute against the site origin.
 */
export const buildBreadcrumbList = (items: BreadcrumbItem[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => {
    const element: JsonLd = {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
    }
    if (item.path) {
      element.item = item.path.startsWith('http') ? item.path : canonicalUrl(item.path)
    }
    return element
  }),
})

// ---------------------------------------------------------------------------
// Per-entity builder slots — typed stubs that later epics fill in. Each returns
// a JSON-LD node so callers wire identically once implemented.
// ---------------------------------------------------------------------------

export interface NewsArticleInput {
  headline: string
  path: string
  description?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
  imageUrls?: string[]
}

/**
 * NewsArticle JSON-LD (FR11). Each article emits this. Later epic (news) extends the
 * input as the Article collection lands; the base shape is established here.
 */
export const buildNewsArticle = (input: NewsArticleInput): JsonLd => {
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    url: canonicalUrl(input.path),
    mainEntityOfPage: canonicalUrl(input.path),
    publisher: { '@id': ORGANIZATION_ID },
  }
  if (input.description) node.description = input.description
  if (input.datePublished) node.datePublished = input.datePublished
  if (input.dateModified) node.dateModified = input.dateModified
  if (input.authorName) node.author = { '@type': 'Person', name: input.authorName }
  if (input.imageUrls && input.imageUrls.length > 0) {
    node.image = input.imageUrls.map((u) => (u.startsWith('http') ? u : canonicalUrl(u)))
  }
  return node
}

export interface EventInput {
  name: string
  path: string
  startDate: string
  endDate?: string
  description?: string
  /** Place is always present per FR62 (venue business OR the event's own location). */
  location: {
    name: string
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    latitude?: number
    longitude?: number
  }
}

/**
 * Event JSON-LD (FR18). Always carries a location (FR62). Later epic (events) wires this.
 */
export const buildEvent = (input: EventInput): JsonLd => {
  const { location } = input
  const place: JsonLd = { '@type': 'Place', name: location.name }
  if (
    location.streetAddress ||
    location.addressLocality ||
    location.addressRegion ||
    location.postalCode
  ) {
    place.address = {
      '@type': 'PostalAddress',
      ...(location.streetAddress ? { streetAddress: location.streetAddress } : {}),
      ...(location.addressLocality ? { addressLocality: location.addressLocality } : {}),
      ...(location.addressRegion ? { addressRegion: location.addressRegion } : {}),
      ...(location.postalCode ? { postalCode: location.postalCode } : {}),
    }
  }
  if (location.latitude !== undefined && location.longitude !== undefined) {
    place.geo = {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude,
    }
  }
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: input.name,
    url: canonicalUrl(input.path),
    startDate: input.startDate,
    location: place,
  }
  if (input.endDate) node.endDate = input.endDate
  if (input.description) node.description = input.description
  return node
}

export interface LocalBusinessInput {
  name: string
  path: string
  /**
   * The most-specific schema.org LocalBusiness subtype (FR28), e.g. 'Restaurant',
   * 'CafeOrCoffeeShop'. Defaults to the generic 'LocalBusiness'.
   */
  subtype?: string
  description?: string
  telephone?: string
  website?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
  }
  latitude?: number
  longitude?: number
  imageUrls?: string[]
  /**
   * Permissive extra input. Callers (and future epics) may pass through rating-ish data
   * for OTHER uses, but this builder NEVER reads it onto the output — see the guardrail
   * below. Typed `unknown` so no code path can accidentally surface `aggregateRating`.
   */
  [extra: string]: unknown
}

/**
 * LocalBusiness JSON-LD (FR28). Emits the most-specific subtype.
 *
 * NFR1 GUARDRAIL — NO SELF-SERVING `aggregateRating`:
 * This builder MUST NOT emit an `aggregateRating` (or `review`) property. Kingston.FYI's
 * MVP displays ratings only where sourced and never fabricates aggregate-rating structured
 * data. There is deliberately NO code path here that reads, derives, or assigns
 * `aggregateRating` — even if the input object carries rating-like keys. Do not add one.
 */
export const buildLocalBusiness = (input: LocalBusinessInput): JsonLd => {
  // Explicitly construct from an allowlist of fields only. `aggregateRating` is NOT in
  // this set and is never copied from `input`, so it can never appear on the output.
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': input.subtype ?? 'LocalBusiness',
    name: input.name,
    url: canonicalUrl(input.path),
  }
  if (input.description) node.description = input.description
  if (input.telephone) node.telephone = input.telephone
  if (input.website) node.sameAs = input.website
  if (input.address) {
    node.address = {
      '@type': 'PostalAddress',
      ...(input.address.streetAddress ? { streetAddress: input.address.streetAddress } : {}),
      ...(input.address.addressLocality ? { addressLocality: input.address.addressLocality } : {}),
      ...(input.address.addressRegion ? { addressRegion: input.address.addressRegion } : {}),
      ...(input.address.postalCode ? { postalCode: input.address.postalCode } : {}),
    }
  }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    node.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.latitude,
      longitude: input.longitude,
    }
  }
  if (input.imageUrls && input.imageUrls.length > 0) {
    node.image = input.imageUrls.map((u) => (u.startsWith('http') ? u : canonicalUrl(u)))
  }
  return node
}
