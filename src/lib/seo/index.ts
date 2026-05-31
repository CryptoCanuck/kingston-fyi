// Centralized SEO infrastructure (Story 1.8 / FR6 / NFR1).
// Metadata, JSON-LD builders, the <JsonLd> renderer, and sitemap/robots route helpers
// are all exported from here so callers import from a single place.

export * from './metadata'
export * from './jsonld'
export * from './routes'
export { JsonLd } from './JsonLd'
